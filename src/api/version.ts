import { get, post } from './request'
import type {
  VersionCompareParams,
  VersionCompareResult,
  VersionInfo,
  FormatStandardParams,
  FormatStandardResult,
  PageResult,
  PageParams,
} from './types'

export function compareVersions(params: VersionCompareParams) {
  return post<VersionCompareResult>('/version/compare', params as unknown as Record<string, unknown>)
}

export function getVersionList(paperId: string) {
  return get<VersionInfo[]>(`/version/list/${paperId}`)
}

export function getVersionDetail(paperId: string, version: string) {
  return get<VersionInfo>(`/version/detail/${paperId}/${version}`)
}

export function getCompareHistory(params: PageParams) {
  return get<PageResult<VersionCompareResult>>('/version/history', params as unknown as Record<string, unknown>)
}

export function formatStandardize(params: FormatStandardParams) {
  return post<FormatStandardResult>('/format/standardize', params as unknown as Record<string, unknown>)
}

export function getFormatResult(id: string) {
  return get<FormatStandardResult>(`/format/result/${id}`)
}

export function getFormatHistory(params: PageParams) {
  return get<PageResult<FormatStandardResult>>('/format/history', params as unknown as Record<string, unknown>)
}
