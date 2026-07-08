import { get, post, upload } from './request'
import type {
  WritingParams,
  WritingResult,
  PaperCheckParams,
  PaperCheckResult,
  ReductionParams,
  ReductionResult,
  FileUploadResult,
  PageResult,
  PageParams,
} from './types'

export function aiWriting(params: WritingParams) {
  return post<WritingResult>('/writing/ai', params as unknown as Record<string, unknown>)
}

export function getWritingHistory(params: PageParams) {
  return get<PageResult<WritingResult>>('/writing/history', params as unknown as Record<string, unknown>)
}

export function uploadPaper(file: File) {
  return upload<FileUploadResult>('/paper/upload', file)
}

export function checkPaper(params: PaperCheckParams) {
  if (params.file) {
    return upload<PaperCheckResult>('/paper/check', params.file, 'file', {
      title: params.title || '',
    })
  }
  return post<PaperCheckResult>('/paper/check', params as unknown as Record<string, unknown>)
}

export function getCheckResult(id: string) {
  return get<PaperCheckResult>(`/paper/check/result/${id}`)
}

export function getCheckHistory(params: PageParams) {
  return get<PageResult<PaperCheckResult>>('/paper/check/history', params as unknown as Record<string, unknown>)
}

export function reducePaper(params: ReductionParams) {
  return post<ReductionResult>('/paper/reduce', params as unknown as Record<string, unknown>)
}

export function getReductionResult(id: string) {
  return get<ReductionResult>(`/paper/reduce/result/${id}`)
}

export function getReductionHistory(params: PageParams) {
  return get<PageResult<ReductionResult>>('/paper/reduce/history', params as unknown as Record<string, unknown>)
}
