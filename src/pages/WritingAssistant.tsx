/**
 * WritingAssistant页面 - AI 辅助写作
 * 集成 DeepSeek 流式 API，逐字显示写作效果
 * 支持停止生成、复制全文等功能
 */
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { streamAssistWriting } from '../api/essay'
import type { DeepSeekError } from '../api/ai'
import AuthModal from '../components/AuthModal'

function WritingAssistant() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [paperType, setPaperType] = useState('undergraduate')
  const [wordCount, setWordCount] = useState(2000)
  const [style, setStyle] = useState('academic')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const abortRef = useRef(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const sidebarItems = [
    { id: 'topic', name: '选题灵感', icon: 'lightbulb', path: '/topic' },
    { id: 'proposal', name: '开题报告', icon: 'file-text', path: '/proposal' },
    { id: 'outline', name: '智能大纲', icon: 'list', path: '/outline' },
    { id: 'writing', name: '辅助写作', icon: 'pen-tool', path: '/writing-tutoring' },
    { id: 'check', name: '论文查重', icon: 'search', path: '/check' },
    { id: 'reduction', name: '智能降重', icon: 'refresh-cw', path: '/reduction' },
    { id: 'aigc', name: 'AIGC检测', icon: 'shield', path: '/aigc' },
    { id: 'ai-reduction', name: '智能降AI', icon: 'cpu', path: '/ai-reduction' },
    { id: 'answer', name: 'AI生成答辩文稿', icon: 'file-text', path: '/answer' },
    { id: 'ppt', name: 'AI生成答辩PPT', icon: 'presentation', path: '/ppt' },
    { id: 'tutor', name: 'AI模拟导师', icon: 'user-circle', path: '/tutor' },
  ]

  const paperTypeOptions = [
    { value: 'undergraduate', label: '本科毕业论文' },
    { value: 'master', label: '硕士学位论文' },
    { value: 'doctoral', label: '博士学位论文' },
    { value: 'course', label: '课程论文' },
    { value: 'journal', label: '期刊论文' },
  ]

  const wordCountOptions = [
    { value: 1000, label: '约1000字' },
    { value: 2000, label: '约2000字' },
    { value: 3000, label: '约3000字' },
    { value: 5000, label: '约5000字' },
  ]

  const styleOptions = [
    { value: 'academic', label: '学术严谨' },
    { value: 'formal', label: '正式规范' },
    { value: 'casual', label: '通俗易懂' },
  ]

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('请输入论文题目')
      return
    }

    setLoading(true)
    setError('')
    setContent('')
    setCharCount(0)
    abortRef.current = false

    try {
      const stream = streamAssistWriting({
        topic,
        type: 'continue',
        wordCount,
        style: style as 'academic' | 'formal' | 'casual',
      })

      let fullText = ''
      for await (const chunk of stream) {
        if (abortRef.current) break
        fullText += chunk
        setContent(fullText)
        setCharCount(fullText.length)
        if (resultRef.current) {
          resultRef.current.scrollTop = resultRef.current.scrollHeight
        }
      }
    } catch (err: unknown) {
      if (abortRef.current) return
      const deepErr = err as DeepSeekError
      if (deepErr.type) {
        switch (deepErr.type) {
          case 'balance':
            setError('API 余额不足，请联系管理员充值')
            break
          case 'auth':
            setError('API 认证失败，请检查 API Key 配置')
            break
          case 'timeout':
            setError('请求超时，请稍后重试')
            break
          case 'network':
            setError('网络连接失败，请检查网络')
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
      abortRef.current = false
    }
  }, [topic, wordCount, style])

  const handleStop = () => {
    abortRef.current = true
    setLoading(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    setContent('')
    setCharCount(0)
    setError('')
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
                item.id === 'writing'
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
          <h1 className="text-lg font-semibold text-gray-800">AI 辅助写作</h1>
          <div className="ml-auto flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Powered by DeepSeek</span>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-5">写作参数设置</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">论文题目 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="请输入论文题目，如：基于深度学习的图像识别研究"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">论文类型</label>
                    <select
                      value={paperType}
                      onChange={(e) => setPaperType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      {paperTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">字数要求</label>
                    <select
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      {wordCountOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">写作风格</label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      {styleOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !topic.trim()}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                    loading || !topic.trim()
                      ? 'bg-blue-300 text-white cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>AI 写作中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>开始写作</span>
                    </>
                  )}
                </button>

                {loading && (
                  <button
                    onClick={handleStop}
                    className="flex items-center space-x-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                    <span>停止生成</span>
                  </button>
                )}

                {content && !loading && (
                  <button
                    onClick={handleClear}
                    className="flex items-center space-x-2 px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>清空内容</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-800">生成失败</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {(content || loading) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-semibold text-gray-700">生成结果</h3>
                    {loading && (
                      <div className="flex items-center space-x-2 text-blue-500">
                        <div className="flex space-x-1">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs">AI 正在创作中</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-400">
                      已生成 {charCount} 字
                    </span>
                    {content && !loading && (
                      <button
                        onClick={handleCopy}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {copied ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>复制全文</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div
                  ref={resultRef}
                  className="p-6 max-h-[500px] overflow-y-auto"
                >
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {content}
                    {loading && (
                      <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />
                    )}
                  </div>
                </div>

                {loading && (
                  <div className="px-5 py-2.5 border-t border-gray-100 bg-blue-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-blue-600">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>正在生成，请稍候...</span>
                      </div>
                      <span className="text-xs text-blue-400">点击「停止生成」可随时中断</span>
                    </div>
                  </div>
                )}

                {!loading && content && (
                  <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      生成完成，共 {charCount} 字
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopy}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {copied ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>复制全文</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>重新生成</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!content && !loading && !error && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-20 h-20 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-base font-medium text-gray-500 mb-2">开始你的 AI 写作之旅</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  输入论文题目，选择写作参数，AI 将为你生成高质量的学术论文内容
                </p>
                <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-400">
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>流式输出</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>学术风格</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>随时停止</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default WritingAssistant
