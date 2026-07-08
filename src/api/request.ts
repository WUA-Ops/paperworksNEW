import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiResponse } from './types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TIMEOUT = 30000

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    if (data.code === 0 || data.code === 200) {
      return data as unknown as AxiosResponse
    }

    if (data.code === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    const errorMessage = data.message || '请求失败'
    return Promise.reject(new Error(errorMessage))
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 400:
          error.message = '请求参数错误'
          break
        case 401:
          error.message = '未授权，请重新登录'
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          error.message = '拒绝访问'
          break
        case 404:
          error.message = '请求资源不存在'
          break
        case 429:
          error.message = '请求过于频繁，请稍后再试'
          break
        case 500:
          error.message = '服务器内部错误'
          break
        case 502:
          error.message = '网关错误'
          break
        case 503:
          error.message = '服务不可用'
          break
        default:
          error.message = `请求失败 (${status})`
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = '请求超时，请稍后重试'
    } else if (!window.navigator.onLine) {
      error.message = '网络连接已断开，请检查网络'
    } else {
      error.message = '网络异常，请稍后重试'
    }

    return Promise.reject(error)
  }
)

export function get<T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return instance.get(url, { params, ...config })
}

export function post<T>(url: string, data?: Record<string, unknown> | FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return instance.post(url, data, config)
}

export function put<T>(url: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return instance.put(url, data, config)
}

export function del<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return instance.delete(url, config)
}

export function upload<T>(url: string, file: File, fieldName = 'file', data?: Record<string, string>): Promise<ApiResponse<T>> {
  const formData = new FormData()
  formData.append(fieldName, file)
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
  }
  return instance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export default instance
