import { post, get } from './request'
import type {
  LoginParams,
  LoginResult,
  RegisterParams,
  UserInfo,
} from './types'

export function login(params: LoginParams) {
  return post<LoginResult>('/auth/login', params as unknown as Record<string, unknown>)
}

export function register(params: RegisterParams) {
  return post<LoginResult>('/auth/register', params as unknown as Record<string, unknown>)
}

export function logout() {
  return post<null>('/auth/logout')
}

export function getUserInfo() {
  return get<UserInfo>('/auth/userinfo')
}

export function updateUserInfo(data: Partial<UserInfo>) {
  return post<UserInfo>('/auth/update', data as unknown as Record<string, unknown>)
}

export function refreshToken() {
  return post<{ token: string }>('/auth/refresh')
}
