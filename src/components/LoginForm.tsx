import { useState, useEffect } from 'react'
import {
  validateUsername,
  validatePassword,
  validateVerificationCode,
  generateVerificationCode,
  mockUsers,
  type User
} from '../utils/userData'

type AuthView = 'login' | 'register' | 'forgot'

interface LoginFormProps {
  onLoginSuccess?: (user: User) => void
}

/**
 * 登录表单组件
 * 包含登录、注册、忘记密码功能
 */
const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [currentView, setCurrentView] = useState<AuthView>('login')

  // 登录表单状态
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    code: ''
  })

  // 注册表单状态
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    code: ''
  })

  // 忘记密码表单状态
  const [forgotData, setForgotData] = useState({
    username: '',
    newPassword: '',
    confirmPassword: '',
    code: ''
  })

  // 验证码状态
  const [generatedCode, setGeneratedCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [isSending, setIsSending] = useState(false)

  // 错误信息
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 生成验证码
  useEffect(() => {
    setGeneratedCode(generateVerificationCode())
  }, [currentView])

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsSending(false)
    }
  }, [countdown])

  // 处理登录输入变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // 自动清理空白字符（包括空格、制表符等）
    const cleanedValue = value.replace(/\s/g, '')
    setLoginData(prev => ({ ...prev, [name]: cleanedValue }))
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // 处理注册输入变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // 自动清理空白字符（包括空格、制表符等）
    const cleanedValue = value.replace(/\s/g, '')
    setRegisterData(prev => ({ ...prev, [name]: cleanedValue }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // 处理忘记密码输入变化
  const handleForgotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // 自动清理空白字符（包括空格、制表符等）
    const cleanedValue = value.replace(/\s/g, '')
    setForgotData(prev => ({ ...prev, [name]: cleanedValue }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // 获取验证码
  const handleGetCode = (username: string) => {
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      setErrors(prev => ({ ...prev, username: usernameValidation.message }))
      return
    }

    setIsSending(true)
    setCountdown(60)
    const newCode = generateVerificationCode()
    setGeneratedCode(newCode)

    // 模拟发送验证码
    setTimeout(() => {
      alert(`验证码已发送：${newCode}`)
    }, 500)
  }

  // 登录提交
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const usernameValidation = validateUsername(loginData.username)
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.message
    }

    const passwordValidation = validatePassword(loginData.password)
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message
    }

    const codeValidation = validateVerificationCode(loginData.code)
    if (!codeValidation.valid) {
      newErrors.code = codeValidation.message
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // 验证验证码
    if (loginData.code.toLowerCase() !== generatedCode.toLowerCase()) {
      setErrors({ code: '验证码错误' })
      return
    }

    // 查找用户
    const user = mockUsers.find(u => u.username === loginData.username)
    if (!user) {
      setErrors({ username: '用户不存在，请先注册' })
      return
    }

    if (user.password !== loginData.password) {
      setErrors({ password: '密码错误' })
      return
    }

    // 登录成功
    alert('登录成功！')
    onLoginSuccess?.(user)
  }

  // 注册提交
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const usernameValidation = validateUsername(registerData.username)
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.message
    }

    const passwordValidation = validatePassword(registerData.password)
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    const codeValidation = validateVerificationCode(registerData.code)
    if (!codeValidation.valid) {
      newErrors.code = codeValidation.message
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (registerData.code.toLowerCase() !== generatedCode.toLowerCase()) {
      setErrors({ code: '验证码错误' })
      return
    }

    // 检查用户是否已存在
    const existingUser = mockUsers.find(u => u.username === registerData.username)
    if (existingUser) {
      setErrors({ username: '该用户已存在' })
      return
    }

    // 注册成功
    const newUser: User = {
      id: mockUsers.length + 1,
      username: registerData.username,
      password: registerData.password,
      type: /^1[3-9]\d{9}$/.test(registerData.username) ? 'phone' : 'email'
    }
    mockUsers.push(newUser)
    alert('注册成功！请登录')
    setCurrentView('login')
    setRegisterData({ username: '', password: '', confirmPassword: '', code: '' })
    setGeneratedCode(generateVerificationCode())
  }

  // 忘记密码提交
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const usernameValidation = validateUsername(forgotData.username)
    if (!usernameValidation.valid) {
      newErrors.username = usernameValidation.message
    }

    const passwordValidation = validatePassword(forgotData.newPassword)
    if (!passwordValidation.valid) {
      newErrors.newPassword = passwordValidation.message
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    const codeValidation = validateVerificationCode(forgotData.code)
    if (!codeValidation.valid) {
      newErrors.code = codeValidation.message
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (forgotData.code.toLowerCase() !== generatedCode.toLowerCase()) {
      setErrors({ code: '验证码错误' })
      return
    }

    // 查找用户并重置密码
    const user = mockUsers.find(u => u.username === forgotData.username)
    if (!user) {
      setErrors({ username: '用户不存在' })
      return
    }

    user.password = forgotData.newPassword
    alert('密码重置成功！请使用新密码登录')
    setCurrentView('login')
    setForgotData({ username: '', newPassword: '', confirmPassword: '', code: '' })
    setGeneratedCode(generateVerificationCode())
  }

  // 切换视图时重置错误
  const switchView = (view: AuthView) => {
    setCurrentView(view)
    setErrors({})
    setCountdown(0)
    setIsSending(false)
    setGeneratedCode(generateVerificationCode())
  }

  // 渲染输入框错误提示
  const renderError = (field: string) => {
    if (errors[field]) {
      return <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
    }
    return null
  }

  // 登录视图
  const renderLoginView = () => (
    <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-5 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-700">登录</h2>
        <button
          type="button"
          onClick={() => alert('微信扫码登录功能开发中')}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c4.801 0 8.692-3.287 8.692-7.341 0-4.054-3.891-7.339-8.692-7.339z"/>
          </svg>
          <span className="text-xs">微信扫码登录</span>
        </button>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="username"
            value={loginData.username}
            onChange={handleLoginChange}
            placeholder="请输入手机号或邮箱"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition-all duration-200 text-sm ${
              errors.username ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('username')}
        </div>

        <div>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleLoginChange}
            placeholder="请输入密码（大写+小写+数字+特殊符号）"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition-all duration-200 text-sm ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('password')}
        </div>

        <div>
          <div className="flex space-x-2">
            <input
              type="text"
              name="code"
              value={loginData.code}
              onChange={handleLoginChange}
              placeholder="请输入验证码"
              className={`flex-1 px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition-all duration-200 text-sm ${
                errors.code ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => handleGetCode(loginData.username)}
              disabled={isSending}
              className="w-24 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs cursor-pointer hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
          {renderError('code')}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
        >
          登录
        </button>
      </form>

      <div className="flex justify-between mt-4 pt-4 border-t border-blue-200">
        <button
          onClick={() => switchView('register')}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          立即注册
        </button>
        <button
          onClick={() => switchView('forgot')}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          忘记密码
        </button>
      </div>
    </div>
  )

  // 注册视图
  const renderRegisterView = () => (
    <div className="bg-green-100 border-2 border-green-500 rounded-lg p-5 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-700">用户注册</h2>
        <button
          onClick={() => switchView('login')}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          返回登录
        </button>
      </div>

      <form onSubmit={handleRegisterSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="username"
            value={registerData.username}
            onChange={handleRegisterChange}
            placeholder="请输入手机号或邮箱"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 transition-all duration-200 text-sm ${
              errors.username ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('username')}
        </div>

        <div>
          <input
            type="password"
            name="password"
            value={registerData.password}
            onChange={handleRegisterChange}
            placeholder="设置密码（大写+小写+数字+特殊符号，8-12位）"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 transition-all duration-200 text-sm ${
              errors.password ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('password')}
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            value={registerData.confirmPassword}
            onChange={handleRegisterChange}
            placeholder="确认密码"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 transition-all duration-200 text-sm ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('confirmPassword')}
        </div>

        <div>
          <div className="flex space-x-2">
            <input
              type="text"
              name="code"
              value={registerData.code}
              onChange={handleRegisterChange}
              placeholder="请输入验证码"
              className={`flex-1 px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 transition-all duration-200 text-sm ${
                errors.code ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => handleGetCode(registerData.username)}
              disabled={isSending}
              className="w-24 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center text-xs cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
          {renderError('code')}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200"
        >
          注册
        </button>
      </form>
    </div>
  )

  // 忘记密码视图
  const renderForgotView = () => (
    <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-5 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-700">重置密码</h2>
        <button
          onClick={() => switchView('login')}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          返回登录
        </button>
      </div>

      <form onSubmit={handleForgotSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="username"
            value={forgotData.username}
            onChange={handleForgotChange}
            placeholder="请输入手机号或邮箱"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300 transition-all duration-200 text-sm ${
              errors.username ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('username')}
        </div>

        <div>
          <input
            type="password"
            name="newPassword"
            value={forgotData.newPassword}
            onChange={handleForgotChange}
            placeholder="设置新密码（大写+小写+数字+特殊符号，8-12位）"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300 transition-all duration-200 text-sm ${
              errors.newPassword ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('newPassword')}
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            value={forgotData.confirmPassword}
            onChange={handleForgotChange}
            placeholder="确认新密码"
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300 transition-all duration-200 text-sm ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {renderError('confirmPassword')}
        </div>

        <div>
          <div className="flex space-x-2">
            <input
              type="text"
              name="code"
              value={forgotData.code}
              onChange={handleForgotChange}
              placeholder="请输入验证码"
              className={`flex-1 px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-300 transition-all duration-200 text-sm ${
                errors.code ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => handleGetCode(forgotData.username)}
              disabled={isSending}
              className="w-24 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs cursor-pointer hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
          {renderError('code')}
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all duration-200"
        >
          重置密码
        </button>
      </form>
    </div>
  )

  return (
    <div className="w-full">
      {currentView === 'login' && renderLoginView()}
      {currentView === 'register' && renderRegisterView()}
      {currentView === 'forgot' && renderForgotView()}
    </div>
  )
}

export default LoginForm
