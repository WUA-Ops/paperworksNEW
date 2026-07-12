/**
 * .docx 文件解析工具
 * 将 .docx 文件发送到后端解析，返回提取的文本内容
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 解析 .docx 文件，提取纯文本内容
 * @param file 用户上传的 .docx 文件
 * @returns 解析后的文本内容和字数
 */
export async function parseDocx(file: File): Promise<{ text: string; wordCount: number }> {
  // 将文件转为 base64
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  const fileBase64 = btoa(binary)

  const response = await fetch(`${API_BASE}/parse-docx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileBase64,
      fileName: file.name,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '解析失败' }))
    throw new Error(errorData.error || errorData.message || '文档解析失败')
  }

  const data = await response.json()
  return {
    text: data.text,
    wordCount: data.wordCount,
  }
}
