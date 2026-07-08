import { get, post } from './request'
import type {
  TopicInspirationParams,
  TopicItem,
  PageResult,
  PageParams,
} from './types'

export function getTopicInspirations(params: TopicInspirationParams & PageParams) {
  return post<TopicItem[]>('/topic/inspirations', params as unknown as Record<string, unknown>)
}

export function getTopicDetail(id: string) {
  return get<TopicItem>(`/topic/detail/${id}`)
}

export function generateTopics(params: TopicInspirationParams) {
  return post<TopicItem[]>('/topic/generate', params as unknown as Record<string, unknown>)
}

export function getTopicHistory(params: PageParams) {
  return get<PageResult<TopicItem>>('/topic/history', params as unknown as Record<string, unknown>)
}

export function saveTopic(topic: TopicItem) {
  return post<TopicItem>('/topic/save', topic as unknown as Record<string, unknown>)
}
