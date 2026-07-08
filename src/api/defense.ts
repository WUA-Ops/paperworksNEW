import { get, post, upload } from './request'
import type {
  PPTParams,
  PPTResult,
  DefenseScriptParams,
  DefenseScriptResult,
  TutorSimulationParams,
  TutorSimulationResult,
  PageResult,
  PageParams,
} from './types'

export function generatePPT(params: PPTParams) {
  if (params.file) {
    return upload<PPTResult>('/ppt/generate', params.file, 'file', {
      templateId: String(params.templateId),
      version: params.version,
      title: params.title || '',
    })
  }
  return post<PPTResult>('/ppt/generate', params as unknown as Record<string, unknown>)
}

export function getPPTDetail(id: string) {
  return get<PPTResult>(`/ppt/detail/${id}`)
}

export function getPPTHistory(params: PageParams) {
  return get<PageResult<PPTResult>>('/ppt/history', params as unknown as Record<string, unknown>)
}

export function downloadPPT(id: string) {
  return get<{ downloadUrl: string }>(`/ppt/download/${id}`)
}

export function getPPTTemplates() {
  return get<PPTResult['templateId'][]>('/ppt/templates')
}

export function generateDefenseScript(params: DefenseScriptParams) {
  return post<DefenseScriptResult>('/defense/script', params as unknown as Record<string, unknown>)
}

export function getDefenseScriptDetail(id: string) {
  return get<DefenseScriptResult>(`/defense/script/detail/${id}`)
}

export function getDefenseScriptHistory(params: PageParams) {
  return get<PageResult<DefenseScriptResult>>('/defense/script/history', params as unknown as Record<string, unknown>)
}

export function tutorSimulate(params: TutorSimulationParams) {
  return post<TutorSimulationResult>('/defense/tutor', params as unknown as Record<string, unknown>)
}

export function getTutorHistory(params: PageParams) {
  return get<PageResult<TutorSimulationResult>>('/defense/tutor/history', params as unknown as Record<string, unknown>)
}
