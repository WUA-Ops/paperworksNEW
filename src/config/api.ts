/**
 * DeepSeek API 配置（安全版本）
 *
 * 前端不再直接存储 API Key，所有请求通过后端代理转发
 * 模型配置保留在前端，方便统一管理和切换
 */

export const deepseekConfig = {
  defaultModel: 'deepseek-chat',
  maxTokens: 4096,
  temperature: 0.7,
  topP: 1,
} as const

export const DEEPSEEK_MODELS = {
  CHAT: 'deepseek-chat',
  REASONER: 'deepseek-reasoner',
} as const

export type DeepSeekModel = (typeof DEEPSEEK_MODELS)[keyof typeof DEEPSEEK_MODELS]

export function createChatCompletionPayload(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: DeepSeekModel = deepseekConfig.defaultModel,
  options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }
) {
  return {
    model,
    messages,
    temperature: options?.temperature ?? deepseekConfig.temperature,
    max_tokens: options?.maxTokens ?? deepseekConfig.maxTokens,
    top_p: options?.topP ?? deepseekConfig.topP,
  }
}

// ⚠️ 已删除：baseURL、apiKey、getDeepSeekHeaders
// 这些现在由后端代理管理，不再暴露在前端
