import { get, post } from './request'
import type {
  ProposalParams,
  ProposalResult,
  PageResult,
  PageParams,
} from './types'

export function generateProposal(params: ProposalParams) {
  return post<ProposalResult>('/proposal/generate', params as unknown as Record<string, unknown>)
}

export function getProposalDetail(id: string) {
  return get<ProposalResult>(`/proposal/detail/${id}`)
}

export function getProposalHistory(params: PageParams) {
  return get<PageResult<ProposalResult>>('/proposal/history', params as unknown as Record<string, unknown>)
}

export function updateProposal(id: string, data: Partial<ProposalResult>) {
  return post<ProposalResult>(`/proposal/update/${id}`, data as unknown as Record<string, unknown>)
}

export function exportProposal(id: string, format: 'docx' | 'pdf') {
  return get<{ downloadUrl: string }>(`/proposal/export/${id}`, { format })
}
