/**
 * Header组件 - 顶部导航栏
 * 包含Logo、导航菜单、搜索按钮和用户图标
 */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthModal from './AuthModal'

const Header = () => {
  const location = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // 导航菜单数据
  const navItems = [
    { name: '首页', path: '/' },
    { name: '选题灵感', path: '/topic' },
    { name: '开题报告', path: '/proposal' },
    { name: '智能大纲', path: '/outline' },
    { name: '写作辅导', path: '/writing-tutoring' },
    { name: '格式规范', path: '/format' },
    { name: '论文查重', path: '/check' },
    { name: '智能降重', path: '/reduction' },
    { name: 'AIGC检测', path: '/aigc' },
    { name: '智能降AI', path: '/ai-reduction' },
    { name: 'AI生成答辩文稿', path: '/answer' },
    { name: 'AI生成答辩PPT', path: '/ppt' },
    { name: 'AI答辩导师', path: '/tutor' },
  ]

  return (
    <header className="bg-blue-500 h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-lg sticky top-0 z-50">
      {/* Logo区域 */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-white">智研笔</span>
      </div>

      {/* 导航菜单 */}
      <nav className="hidden md:flex items-center space-x-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={index}
              to={item.path}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-white text-blue-500'
                  : 'text-white hover:bg-blue-600 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* 搜索和用户按钮 */}
      <div className="flex items-center space-x-3">
        {/* 上传链接 */}
        <Link
          to="/upload"
          className="text-sm text-white hover:text-yellow-300 transition-colors"
        >
          上传
        </Link>
        
        {/* 搜索按钮 */}
        <button className="w-8 h-8 flex items-center justify-center text-white hover:bg-blue-600 rounded-full transition-all duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* 用户图标 */}
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-blue-600 rounded-full transition-all duration-200"
          title="登录/注册"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  )
}

export default Header
