import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite 开发服务器中间件：代理 DeepSeek API 请求
 * 将 /api/chat 和 /api/chat-stream 请求转发到 DeepSeek API
 * API Key 从环境变量 DEEPSEEK_API_KEY 读取，不暴露给前端
 */
function deepseekProxy(env: Record<string, string>): Plugin {
  return {
    name: 'deepseek-api-proxy',
    configureServer(server) {
      const API_KEY = env.DEEPSEEK_API_KEY
      const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

      // 解析请求体
      function parseBody(req: any): Promise<any> {
        return new Promise((resolve, reject) => {
          let body = ''
          req.on('data', (chunk: string) => { body += chunk })
          req.on('end', () => {
            try { resolve(JSON.parse(body)) }
            catch { reject(new Error('Invalid JSON')) }
          })
          req.on('error', reject)
        })
      }

      // 设置 CORS 头
      function setCorsHeaders(res: any) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      }

      // 非流式代理
      async function handleChat(req: any, res: any) {
        const { systemPrompt, userPrompt, model, temperature, maxTokens, topP } = await parseBody(req)

        const response = await fetch(DEEPSEEK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: temperature ?? 0.7,
            max_tokens: maxTokens ?? 4096,
            top_p: topP ?? 1,
            stream: false
          })
        })

        if (!response.ok) {
          const error = await response.text()
          res.statusCode = response.status
          res.end(JSON.stringify({ error }))
          return
        }

        const data = await response.json()
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(data))
      }

      // 流式代理
      async function handleStream(req: any, res: any) {
        const { systemPrompt, userPrompt, model, temperature, maxTokens, topP } = await parseBody(req)

        const response = await fetch(DEEPSEEK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: temperature ?? 0.7,
            max_tokens: maxTokens ?? 4096,
            top_p: topP ?? 1,
            stream: true
          })
        })

        if (!response.ok) {
          const error = await response.text()
          res.statusCode = response.status
          res.end(JSON.stringify({ error }))
          return
        }

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(decoder.decode(value, { stream: true }))
          }
        } catch (err) {
          console.error('Stream error:', err)
        } finally {
          reader.releaseLock()
          res.end()
        }
      }

      // 解析 .docx 文件
      async function handleParseDocx(req: any, res: any) {
        const { fileBase64, fileName } = await parseBody(req)
        if (!fileBase64) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: '缺少文件内容' }))
          return
        }

        try {
          // 动态导入 mammoth（仅在开发服务器中使用）
          const mammoth = await import('mammoth')
          const buffer = Buffer.from(fileBase64, 'base64')
          const result = await mammoth.extractRawText({ buffer })
          const text = result.value

          if (!text || text.trim().length === 0) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: '文档内容为空或无法解析' }))
            return
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            text: text.trim(),
            wordCount: text.trim().length,
            fileName: fileName || 'unknown.docx'
          }))
        } catch (err: any) {
          console.error('Docx parse error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: '文档解析失败', message: err.message }))
        }
      }

      // 注册中间件
      server.middlewares.use('/api/parse-docx', (req, res, next) => {
        setCorsHeaders(res)
        if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return }
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return }
        handleParseDocx(req, res).catch(err => {
          console.error('Docx parse error:', err)
          if (!res.headersSent) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal server error' })) }
        })
      })

      server.middlewares.use('/api/chat', (req, res, next) => {
        setCorsHeaders(res)
        if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return }
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return }
        handleChat(req, res).catch(err => {
          console.error('Chat proxy error:', err)
          if (!res.headersSent) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal server error' })) }
        })
      })

      server.middlewares.use('/api/chat-stream', (req, res, next) => {
        setCorsHeaders(res)
        if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return }
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return }
        handleStream(req, res).catch(err => {
          console.error('Stream proxy error:', err)
          if (!res.headersSent) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Internal server error' })) }
        })
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), deepseekProxy(env)],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
