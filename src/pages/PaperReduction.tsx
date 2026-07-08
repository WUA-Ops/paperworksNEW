/**
 * PaperReduction页面 - 智能降重页面
 * 通过智能语义重组，提升论文的人类撰写感 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { streamReducePlagiarism } from '../api/essay'
import AuthModal from '../components/AuthModal'

/**
 * PaperReduction页面主函数组�? * @returns 智能降重页面布局
 */
function PaperReduction() {
  const navigate = useNavigate()
  const [originalText, setOriginalText] = useState('')
  const [resultText, setResultText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

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

  const handleStartReduction = async () => {
    if (!originalText.trim()) return
    
    setIsProcessing(true)
    setResultText('')
    
    try {
      const generator = streamReducePlagiarism({
        content: originalText,
        targetRate: 15
      })
      
      for await (const chunk of generator) {
        setResultText(prev => prev + chunk)
      }
    } catch (error) {
      console.error('降重失败:', error)
      alert('降重失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearContent = () => {
    setOriginalText('')
    setResultText('')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 左侧侧边栏 */}
      <aside className="w-56 bg-blue-50 border-r border-blue-100 flex flex-col">
        {/* Logo区域 */}
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

        {/* 导航菜单 */}
        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                item.id === 'reduction'
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

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部标题栏*/}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-800">智能降重</h1>
          
          {/* 右侧搜索和设置 */}
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索功能或文档.."
                className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="刷新页面"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
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

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* 降重工具标题 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">降重工具</h2>
              <p className="text-gray-500">通过智能语义重组，提升论文的人类撰写感。</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end mb-4 space-x-3">
              <button
                onClick={handleClearContent}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                清除内容
              </button>
              <button
                onClick={handleStartReduction}
                disabled={isProcessing || !originalText.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{isProcessing ? '降重中...' : '开始降重'}</span>
              </button>
            </div>

            {/* 双栏布局 */}
            <div className="flex gap-6">
              {/* 左侧 - 原始文本输入 */}
              <div className="flex-1">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* 标题栏*/}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between">
                    <span className="font-medium text-gray-700">原始文本</span>
                    <span className="text-sm text-gray-500">字数: {originalText.length}</span>
                  </div>
                  {/* 输入区域 */}
                  <textarea
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    placeholder="请粘贴需要降重的论文片段..."
                    rows={20}
                    className="w-full px-4 py-3 resize-none focus:outline-none text-gray-700"
                  />
                </div>
              </div>

              {/* 右侧 - 改写结果 */}
              <div className="flex-1">
                <div className="bg-blue-50 rounded-xl border border-blue-100 overflow-hidden h-full">
                  {/* 标题栏*/}
                  <div className="px-4 py-3 bg-blue-100 border-b border-blue-100">
                    <span className="font-medium text-purple-600">改写结果</span>
                  </div>
                  {/* 结果区域 */}
                  <div className="p-4 min-h-[480px] flex flex-col justify-center items-center">
                    {resultText ? (
                      <p className="text-gray-700 leading-relaxed text-left w-full">
                        {resultText}
                      </p>
                    ) : isProcessing ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500">正在降重中...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4 text-gray-400">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <p className="text-center">改写后的内容将按流式显示在这里</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default PaperReduction
