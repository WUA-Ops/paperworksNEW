/**
 * AIGCDetection页面 - AIGC 检测
 * 集成 DeepSeek API，AI 智能分析文本是否由 AI 生成
 * 展示 AI 生成概率、判断依据和降低 AI 痕迹的建议
 * 使用紫色主题
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { detectAIGC } from '../api/essay'
import type { DeepSeekError } from '../api/ai'
import AuthModal from '../components/AuthModal'

interface DetectionResult {
  probability: number
  level: string
  indicators: Array<{
    type: string
    description: string
    score: number
  }>
  aiSegments: string[]
  suggestions: string[]
}

function AIGCDetection() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const MIN_WORDS = 200

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

  const getProbabilityColor = (probability: number) => {
    if (probability < 30) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500', label: '低风险' }
    if (probability < 60) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-500', label: '中等风险' }
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-500', label: '高风险' }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    setWordCount(text.length)
    if (result) setResult(null)
  }

  const handleDetect = async () => {
    if (wordCount < MIN_WORDS) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await detectAIGC({ content })
      setResult(res)
    } catch (err: unknown) {
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
            setError(deepErr.message || '检测失败，请稍后重试')
        }
      } else {
        setError('检测失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setContent('')
    setWordCount(0)
    setResult(null)
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
        return <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
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
      <aside className="w-56 bg-purple-50 border-r border-purple-100 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-purple-100">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-purple-600">智研笔</span>
          </div>
        </div>
        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                item.id === 'aigc' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-purple-50'
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
          <h1 className="text-lg font-semibold text-gray-800">AIGC 检测</h1>
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
          <div className="max-w-5xl mx-auto">
            {!result ? (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">AIGC 检测</h2>
                      <p className="text-sm text-gray-500">AI 智能分析文本是否由 AI 生成，提供判断依据和降低 AI 痕迹的建议</p>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={content}
                      onChange={handleTextChange}
                      placeholder="请在此输入或粘贴需要检测的文本内容（建议不少于200字）"
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm leading-relaxed"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${wordCount < MIN_WORDS ? 'text-red-400' : 'text-gray-400'}`}>
                        已输入 {wordCount} 字 {wordCount < MIN_WORDS && `（最少需要 ${MIN_WORDS} 字）`}
                      </span>
                      {content && (
                        <button onClick={() => { setContent(''); setWordCount(0) }} className="text-xs text-gray-400 hover:text-gray-600">
                          清空
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">检测失败</p>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleDetect}
                    disabled={loading || wordCount < MIN_WORDS}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all text-sm ${
                      loading || wordCount < MIN_WORDS
                        ? 'bg-purple-300 text-white cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-md'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>AI 分析中...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>开始检测</span>
                      </>
                    )}
                  </button>
                </div>

                {loading && (
                  <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-5">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-purple-800">AI 正在分析你的文本</p>
                        <p className="text-xs text-purple-600 mt-1">正在检测语言特征、分析逻辑结构、识别 AI 痕迹...</p>
                      </div>
                    </div>
                    <div className="mt-4 w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-purple-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-gray-800">检测结果</h2>
                    <button onClick={handleReset} className="text-sm text-purple-500 hover:text-purple-600 flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>重新检测</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={result.probability < 30 ? '#22c55e' : result.probability < 60 ? '#eab308' : '#ef4444'}
                          strokeWidth="8"
                          strokeDasharray={`${result.probability * 2.83} ${283 - result.probability * 2.83}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${getProbabilityColor(result.probability).text}`}>
                          {result.probability}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">%</span>
                        <span className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getProbabilityColor(result.probability).bg} ${getProbabilityColor(result.probability).text} border ${getProbabilityColor(result.probability).border}`}>
                          {getProbabilityColor(result.probability).label}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">AI 生成概率</p>
                          <p className={`text-sm font-semibold ${getProbabilityColor(result.probability).text}`}>{result.probability}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">风险等级</p>
                          <p className={`text-sm font-semibold ${getProbabilityColor(result.probability).text}`}>{result.level || getProbabilityColor(result.probability).label}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">原文总字数</p>
                          <p className="text-sm font-semibold text-gray-800">{wordCount} 字</p>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-600 mb-1">检测说明</p>
                        <p className="text-sm text-gray-700">
                          {result.probability < 30
                            ? '该文本 AI 生成概率较低，具有较强的人类撰写特征。'
                            : result.probability < 60
                            ? '该文本存在一定的 AI 生成痕迹，建议进行适当修改。'
                            : '该文本 AI 生成概率较高，强烈建议进行改写以降低 AI 痕迹。'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {result.indicators && result.indicators.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span>判断依据 ({result.indicators.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {result.indicators.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-purple-50 border border-purple-100 rounded-lg p-4">
                          <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-800">{item.type}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.score > 60 ? 'bg-red-100 text-red-700' : item.score > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {item.score}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.aiSegments && result.aiSegments.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>疑似 AI 生成片段 ({result.aiSegments.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {result.aiSegments.map((segment, index) => (
                        <div key={index} className="border border-red-100 bg-red-50/50 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <p className="text-sm text-gray-700 leading-relaxed">"{segment}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>降低 AI 痕迹的建议</span>
                    </h3>
                    <div className="space-y-3">
                      {result.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start space-x-3 bg-green-50 border border-green-100 rounded-lg p-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={handleReset} className="flex items-center space-x-2 px-6 py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>重新检测</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default AIGCDetection