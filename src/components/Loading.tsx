/**
 * Loading组件 - 全局加载状态
 * 显示全屏遮罩层和加载动画
 */
import { useEffect, useState } from 'react'

interface LoadingProps {
  visible: boolean
  text?: string
  fullScreen?: boolean
}

const Loading = ({ visible, text = '加载中...', fullScreen = true }: LoadingProps) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
    } else {
      setTimeout(() => setShow(false), 300)
    }
  }, [visible])

  if (!show) return null

  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0' : 'relative'
      } flex items-center justify-center z-[9999] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {fullScreen && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />}
      
      <div className="relative bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center space-y-4">
        {/* 加载动画 */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-[#409eff] rounded-full animate-spin" />
        </div>

        {/* 加载文字 */}
        <p className="text-sm text-gray-600 font-medium">{text}</p>

        {/* 进度点 */}
        <div className="flex space-x-1">
          <span className="w-1.5 h-1.5 bg-[#409eff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-[#409eff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-[#409eff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default Loading