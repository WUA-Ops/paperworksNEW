/**
 * AuthModal组件 - 登录注册模态框
 * 点击用户图标弹出，支持登录/注册切换
 */
import { useState } from 'react'
import { register, login, getCurrentUser, logout } from '../utils/userStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthChange?: () => void
}

function AuthModal({ isOpen, onClose, onAuthChange }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loggedInUser, setLoggedInUser] = useState(getCurrentUser())

  if (!isOpen) return null

  const handleLogin = () => {
    if (!loginForm.username.trim()) {
      setMessage({ type: 'error', text: '请输入用户名' })
      return
    }
    if (!loginForm.password.trim()) {
      setMessage({ type: 'error', text: '请输入密码' })
      return
    }

    const result = login(loginForm.username, loginForm.password)
    if (result.success) {
      setMessage({ type: 'success', text: '登录成功！' })
      setLoggedInUser(getCurrentUser())
      onAuthChange?.()
      setTimeout(() => {
        onClose()
        setMessage({ type: '', text: '' })
      }, 1000)
    } else {
      setMessage({ type: 'error', text: result.message })
    }
  }

  const handleRegister = () => {
    if (!registerForm.username.trim()) {
      setMessage({ type: 'error', text: '请输入用户名' })
      return
    }
    if (!registerForm.email.trim()) {
      setMessage({ type: 'error', text: '请输入邮箱' })
      return
    }
    if (!registerForm.password.trim()) {
      setMessage({ type: 'error', text: '请输入密码' })
      return
    }
    if (registerForm.password.length < 6) {
      setMessage({ type: 'error', text: '密码长度不能少于6位' })
      return
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' })
      return
    }

    const result = register(registerForm.username, registerForm.email, registerForm.password)
    if (result.success) {
      setMessage({ type: 'success', text: '注册成功！请登录' })
      setActiveTab('login')
      setLoginForm({ ...loginForm, username: registerForm.username })
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' })
    } else {
      setMessage({ type: 'error', text: result.message })
    }
  }

  const handleLogout = () => {
    logout()
    setLoggedInUser(null)
    setLoginForm({ username: '', password: '' })
    setMessage({ type: 'success', text: '已退出登录' })
    onAuthChange?.()
    setTimeout(() => {
      onClose()
      setMessage({ type: '', text: '' })
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 模态框主体 */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部蓝色渐变背景 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">智研笔</h2>
          <p className="text-blue-100 text-sm mt-1">毕业论文写作平台</p>
        </div>

        {/* 已登录状态 */}
        {loggedInUser ? (
          <div className="px-8 py-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{loggedInUser.username}</h3>
              <p className="text-sm text-gray-500">{loggedInUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              退出登录
            </button>
          </div>
        ) : (
          <>
            {/* Tab切换 */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => { setActiveTab('login'); setMessage({ type: '', text: '' }) }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => { setActiveTab('register'); setMessage({ type: '', text: '' }) }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'register'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                注册
              </button>
            </div>

            {/* 消息提示 */}
            {message.text && (
              <div className={`mx-6 mt-4 p-3 rounded-lg text-sm flex items-center space-x-2 ${
                message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message.type === 'error' ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* 登录表单 */}
            {activeTab === 'login' && (
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      placeholder="请输入用户名"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="请输入密码"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-600">记住我</span>
                  </label>
                  <button className="text-sm text-blue-600 hover:text-blue-800">忘记密码？</button>
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  登录
                </button>
                <div className="text-center">
                  <span className="text-sm text-gray-500">还没有账号？</span>
                  <button
                    onClick={() => { setActiveTab('register'); setMessage({ type: '', text: '' }) }}
                    className="text-sm text-blue-600 hover:text-blue-800 ml-1"
                  >
                    立即注册
                  </button>
                </div>
              </div>
            )}

            {/* 注册表单 */}
            {activeTab === 'register' && (
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      placeholder="请输入用户名"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="请输入邮箱"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="请输入密码（至少6位）"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      placeholder="请再次输入密码"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    />
                  </div>
                </div>
                <button
                  onClick={handleRegister}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  注册
                </button>
                <div className="text-center">
                  <span className="text-sm text-gray-500">已有账号？</span>
                  <button
                    onClick={() => { setActiveTab('login'); setMessage({ type: '', text: '' }) }}
                    className="text-sm text-blue-600 hover:text-blue-800 ml-1"
                  >
                    去登录
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AuthModal
