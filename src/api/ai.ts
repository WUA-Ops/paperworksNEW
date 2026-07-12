/**
 * DeepSeek AI API 调用封装（安全版本）
 *
 * 通过后端代理调用 DeepSeek API，API Key 不再暴露在前端
 * 支持普通调用和流式调用
 */

import { deepseekConfig } from '../config/api'

const TIMEOUT_MS = 30000
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

interface DeepSeekError {
  type: 'network' | 'timeout' | 'auth' | 'balance' | 'rate_limit' | 'server' | 'unknown'
  message: string
  code?: number
}

function createError(type: DeepSeekError['type'], message: string, code?: number): DeepSeekError {
  return { type, message, code }
}

function parseHttpError(status: number, body: Record<string, unknown>): DeepSeekError {
  const errorMsg = (body?.error as Record<string, string>)?.message || '请求失败'

  switch (status) {
    case 401:
      return createError('auth', `认证失败：${errorMsg}，请检查 API Key 是否正确`, status)
    case 402:
      return createError('balance', `余额不足：${errorMsg}，请前往 DeepSeek 控制台充值`, status)
    case 429:
      return createError('rate_limit', `请求过于频繁：${errorMsg}，请稍后重试`, status)
    case 500:
    case 502:
    case 503:
      return createError('server', `服务器错误(${status})：${errorMsg}，请稍后重试`, status)
    default:
      return createError('unknown', `请求失败(${status})：${errorMsg}`, status)
  }
}

/**
 * 普通调用 DeepSeek API（通过后端代理）
 * 等待完整响应后返回完整文本
 */
export async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        model: deepseekConfig.defaultModel,
        temperature: deepseekConfig.temperature,
        maxTokens: deepseekConfig.maxTokens,
        topP: deepseekConfig.topP,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorBody: Record<string, unknown> = {}
      try {
        errorBody = await response.json()
      } catch {
        // JSON 解析失败
      }
      throw parseHttpError(response.status, errorBody)
    }

    const data = await response.json()

    if (!data.choices?.length) {
      throw createError('unknown', 'API 返回数据格式异常：没有生成内容')
    }

    return data.choices[0].message?.content || ''
  } catch (error: unknown) {
    clearTimeout(timeoutId)

    if (error && typeof error === 'object' && 'type' in error) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createError('timeout', `请求超时(${TIMEOUT_MS / 1000}秒)，请稍后重试`)
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw createError('network', '网络连接失败，请检查网络后重试')
    }

    throw createError('unknown', error instanceof Error ? error.message : '未知错误')
  }
}

/**
 * 流式调用 DeepSeek API（通过后端代理）
 * Generator 函数，逐字返回 AI 生成的内容
 */
export async function* streamDeepSeek(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response

  try {
    response = await fetch(`${API_BASE}/chat-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        model: deepseekConfig.defaultModel,
        temperature: deepseekConfig.temperature,
        maxTokens: deepseekConfig.maxTokens,
        topP: deepseekConfig.topP,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
  } catch (error: unknown) {
    clearTimeout(timeoutId)

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createError('timeout', `请求超时(${TIMEOUT_MS / 1000}秒)，请稍后重试`)
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw createError('network', '网络连接失败，请检查网络后重试')
    }

    throw createError('unknown', error instanceof Error ? error.message : '未知错误')
  }

  if (!response.ok) {
    let errorBody: Record<string, unknown> = {}
    try {
      errorBody = await response.json()
    } catch {
      // JSON 解析失败
    }
    throw parseHttpError(response.status, errorBody)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw createError('network', '无法获取响应流，浏览器可能不支持 ReadableStream')
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let hasContent = false

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            hasContent = true
            yield delta
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createError('timeout', `流式响应超时(${TIMEOUT_MS / 1000}秒)`)
    }
    throw createError('network', error instanceof Error ? error.message : '流式读取中断')
  } finally {
    reader.releaseLock()
  }

  if (!hasContent) {
    throw createError('unknown', 'API 返回数据格式异常：没有生成内容')
  }
}

export type { DeepSeekError }
