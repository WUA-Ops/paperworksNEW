/**
 * Toast组件 - 全局消息提示
 * 支持成功、错误、警告、信息四种类型
 */
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastConfig {
  message: string
  type: ToastType
  duration?: number
}

interface ToastItem extends ToastConfig {
  id: number
  visible: boolean
}

let toastContainer: HTMLDivElement | null = null
let toastRoot: ReturnType<typeof createRoot> | null = null
let toastId = 0
const toasts: ToastItem[] = []

const typeConfig: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: 'bg-green-500', text: 'text-white', icon: 'M5 13l4 4L19 7' },
  error: { bg: 'bg-red-500', text: 'text-white', icon: 'M6 18L18 6M6 6l12 12' },
  warning: { bg: 'bg-yellow-500', text: 'text-white', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
  info: { bg: 'bg-[#409eff]', text: 'text-white', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
}

const ToastContent = ({ toasts: toastList }: { toasts: ToastItem[] }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col space-y-2 max-w-sm">
      {toastList.map((toast) => {
        const config = typeConfig[toast.type]
        return (
          <div
            key={toast.id}
            className={`${config.bg} ${config.text} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 ${
              toast.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
            </svg>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}

const initContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'toast-container'
    document.body.appendChild(toastContainer)
    toastRoot = createRoot(toastContainer)
  }
}

const renderToasts = () => {
  initContainer()
  if (toastRoot) {
    toastRoot.render(<ToastContent toasts={toasts} />)
  }
}

export const toast = {
  show: (config: ToastConfig) => {
    const id = ++toastId
    const toastItem: ToastItem = { ...config, id, visible: true }
    toasts.push(toastItem)
    renderToasts()

    const duration = config.duration || 3000
    setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id)
      if (index !== -1) {
        toasts[index].visible = false
        renderToasts()
      }
      setTimeout(() => {
        const removeIndex = toasts.findIndex((t) => t.id === id)
        if (removeIndex !== -1) {
          toasts.splice(removeIndex, 1)
          renderToasts()
        }
      }, 300)
    }, duration)
  },

  success: (message: string, duration?: number) => {
    toast.show({ message, type: 'success', duration })
  },

  error: (message: string, duration?: number) => {
    toast.show({ message, type: 'error', duration })
  },

  warning: (message: string, duration?: number) => {
    toast.show({ message, type: 'warning', duration })
  },

  info: (message: string, duration?: number) => {
    toast.show({ message, type: 'info', duration })
  },
}

export default toast