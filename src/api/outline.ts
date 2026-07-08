import { get, post } from './request'
import type {
  OutlineParams,
  OutlineResult,
  PageResult,
  PageParams,
} from './types'

export function generateOutline(params: OutlineParams) {
  return post<OutlineResult>('/outline/generate', params as unknown as Record<string, unknown>)
}

export function getOutlineDetail(id: string) {
  return get<OutlineResult>(`/outline/detail/${id}`)
}

export function getOutlineHistory(params: PageParams) {
  return get<PageResult<OutlineResult>>('/outline/history', params as unknown as Record<string, unknown>)
}

export function updateOutline(id: string, data: Partial<OutlineResult>) {
  return post<OutlineResult>(`/outline/update/${id}`, data as unknown as Record<string, unknown>)
}

export function exportOutline(id: string, format: 'docx' | 'pdf') {
  return get<{ downloadUrl: string }>(`/outline/export/${id}`, { format })
}
