const mammoth = require('mammoth')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 从请求体中获取 base64 编码的文件内容
    const { fileBase64, fileName } = req.body

    if (!fileBase64) {
      return res.status(400).json({ error: '缺少文件内容' })
    }

    // 将 base64 转为 Buffer
    const buffer = Buffer.from(fileBase64, 'base64')

    // 使用 mammoth 解析 .docx
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: '文档内容为空或无法解析' })
    }

    res.status(200).json({
      text: text.trim(),
      wordCount: text.trim().length,
      fileName: fileName || 'unknown.docx'
    })

  } catch (error) {
    console.error('Docx parse error:', error)
    res.status(500).json({
      error: '文档解析失败',
      message: error.message
    })
  }
}
