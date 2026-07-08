import { get, post, upload } from './request'
import type {
  AIGCDetectionParams,
  AIGCDetectionResult,
  AIReductionParams,
  AIReductionResult,
  PageResult,
  PageParams,
} from './types'

export function detectAIGC(params: AIGCDetectionParams) {
  if (params.file) {
    return upload<AIGCDetectionResult>('/aigc/detect', params.file, 'file', {
      title: params.title || '',
    })
  }
  return post<AIGCDetectionResult>('/aigc/detect', params as unknown as Record<string, unknown>)
}

export function getAIGCDetectionResult(id: string) {
  return get<AIGCDetectionResult>(`/aigc/result/${id}`)
}

export function getAIGCDetectionHistory(params: PageParams) {
  return get<PageResult<AIGCDetectionResult>>('/aigc/history', params as unknown as Record<string, unknown>)
}

export function reduceAIGC(params: AIReductionParams) {
  return post<AIReductionResult>('/aigc/reduce', params as unknown as Record<string, unknown>)
}

export function getAIReductionResult(id: string) {
  return get<AIReductionResult>(`/aigc/reduce/result/${id}`)
}

export function getAIReductionHistory(params: PageParams) {
  return get<PageResult<AIReductionResult>>('/aigc/reduce/history', params as unknown as Record<string, unknown>)
}
