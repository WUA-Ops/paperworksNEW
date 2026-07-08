/**
 * TopicInspiration页面 - 选题灵感页面
 * 帮助大学生找到毕业论文选题方向
 * 集成 DeepSeek API，AI 智能生成选题建议
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { streamTopicInspiration } from '../api/essay'
import type { DeepSeekError } from '../api/ai'
import AuthModal from '../components/AuthModal'

function TopicInspiration() {
  const navigate = useNavigate()
  const [titleInput, setTitleInput] = useState('')
  const [education, setEducation] = useState('本科')
  const [wordCount, setWordCount] = useState('12000字左右')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [streamContent, setStreamContent] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const sidebarItems = [
    { id: 'topic', name: '选题灵感', icon: 'lightbulb', path: '/topic' },
    { id: 'proposal', name: '开题报告', icon: 'file-text', path: '/proposal' },
    { id: 'outline', name: '智能大纲', icon: 'list', path: '/outline' },
    { id: 'writing', name: '辅助写作', icon: 'pen-tool', path: '/assistant' },
    { id: 'format', name: '格式规范化', icon: 'layout', path: '/format' },
    { id: 'check', name: '论文查重', icon: 'search', path: '/check' },
    { id: 'reduction', name: '智能降重', icon: 'refresh-cw', path: '/reduction' },
    { id: 'aigc', name: 'AIGC检测', icon: 'shield', path: '/aigc' },
    { id: 'ai-reduction', name: '智能降AI', icon: 'cpu', path: '/ai-reduction' },
    { id: 'answer', name: 'AI生成答辩文稿', icon: 'file-text', path: '/answer' },
    { id: 'ppt', name: 'AI生成答辩PPT', icon: 'presentation', path: '/ppt' },
    { id: 'tutor', name: 'AI模拟导师', icon: 'user-circle', path: '/tutor' },
  ]

  const educationOptions = ['专科', '本科', '硕士']
  const wordCountOptions = ['8000字左右', '12000字左右', '15000字左右', '20000字左右']

  const handleGenerate = async () => {
    if (!titleInput.trim()) {
      setError('请输入学科方向或关键词')
      return
    }

    setLoading(true)
    setError('')
    setStreamContent('')

    try {
      const generator = streamTopicInspiration({
        subject: titleInput,
        count: 5,
      })

      for await (const chunk of generator) {
        setStreamContent(prev => prev + chunk)
      }
    } catch (err: unknown) {
      const deepErr = err as DeepSeekError
      if (deepErr.type) {
        switch (deepErr.type) {
          case 'balance':
            setError('API 余额不足，请联系管理员充值后继续使用')
            break
          case 'auth':
            setError('API 认证失败，请检查 API Key 配置')
            break
          case 'timeout':
            setError('请求超时，请稍后重试')
            break
          case 'network':
            setError('网络连接失败，请检查网络后重试')
            break
          case 'rate_limit':
            setError('请求过于频繁，请稍后再试')
            break
          default:
            setError(deepErr.message || '生成失败，请稍后重试')
        }
      } else {
        setError('生成失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'lightbulb':
        return <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      case 'file-text':
        return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      case 'list':
        return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
      case 'pen-tool':
        return <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      case 'search':
        return <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      case 'refresh-cw':
        return <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      case 'shield':
        return <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      case 'cpu':
        return <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      case 'presentation':
        return <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      case 'user-circle':
        return <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
      default:
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-blue-50 border-r border-blue-100 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-blue-100">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-blue-600">智研笔</span>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                item.id === 'topic'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
            >
              <span className="mr-3">{renderIcon(item.icon)}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-800">选题灵感</h1>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索功能或文档..."
                className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="刷新页面"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>刷新</span>
            </button>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="登录/注册"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-800">为你的毕业论文保驾护航</h2>
              <p className="text-sm text-gray-500 mt-1">AI 智能生成选题建议，助你快速找到研究方向</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">学科方向或关键词</label>
                <div className="relative">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="例如：计算机科学、人工智能、数据挖掘..."
                    maxLength={60}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {titleInput.length}/60
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-8 mb-4">
                <span className="text-sm text-gray-600 w-20">选择学历</span>
                <div className="flex items-center space-x-6">
                  {educationOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="education"
                        value={option}
                        checked={education === option}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <span className="text-sm text-gray-600 w-20">选择字数</span>
                <div className="flex items-center space-x-6">
                  {wordCountOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="wordCount"
                        value={option}
                        checked={wordCount === option}
                        onChange={(e) => setWordCount(e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">选题灵感</h3>

              <div className="mb-6">
                <p className="text-xs text-gray-500">输入你的学科方向，AI将为你生成5个精选选题建议</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !titleInput.trim()}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all font-medium ${
                    loading
                      ? 'bg-blue-300 text-white cursor-not-allowed'
                      : !titleInput.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>AI 生成中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>获取灵感</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">生成失败</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {streamContent && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    <span className="text-blue-500">AI</span> 选题灵感建议
                  </h3>
                  {loading && (
                    <div className="flex items-center space-x-2 text-sm text-blue-500">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>正在生成...</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {streamContent}
                </div>
              </div>
            )}

            {!loading && !streamContent && !error && (
              <div className="mt-8 text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-400 text-sm">输入学科方向，点击「获取灵感」开始生成选题</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default TopicInspiration
