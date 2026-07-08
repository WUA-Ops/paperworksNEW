/**
 * WritingTutoring页面 - 写作辅导系统
 * 按照功能架构总览实现：写作前准备、写作中辅导、写作后优化、辅助工具
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'

interface FeatureItem {
  id: string
  title: string
  description: string
  icon: string
  status: 'available' | 'coming-soon'
}

interface PhaseData {
  id: string
  title: string
  features: FeatureItem[]
}

function WritingTutoring() {
  const navigate = useNavigate()
  const [activePhase, setActivePhase] = useState('phase2')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const phases: PhaseData[] = [
    {
      id: 'phase1',
      title: '1. 写作前准备',
      features: [
        { id: 'topic', title: '选题辅助', description: '热点追踪、题目优化', icon: 'lightbulb', status: 'available' },
        { id: 'outline', title: '大纲生成', description: '模板库、智能生成', icon: 'list', status: 'available' },
        { id: 'literature', title: '文献推荐', description: '自动检索、阅读清单', icon: 'book', status: 'coming-soon' },
      ]
    },
    {
      id: 'phase2',
      title: '2. 写作中辅导（核心）',
      features: [
        { id: 'editor', title: '智能大纲编辑器', description: '可视化、进度追踪', icon: 'layout', status: 'available' },
        { id: 'paragraph', title: '段落写作助手', description: '引言/方法/结果生成', icon: 'pen-tool', status: 'available' },
        { id: 'citation', title: '文献引用管理', description: '一键引用、格式切换', icon: 'link', status: 'available' },
        { id: 'standard', title: '学术规范检查', description: '口语化、标点、图表', icon: 'check-circle', status: 'available' },
        { id: 'plagiarism', title: '实时查重预警', description: '边写边查、标红提示', icon: 'shield', status: 'coming-soon' },
      ]
    },
    {
      id: 'phase3',
      title: '3. 写作后优化',
      features: [
        { id: 'polish', title: '全文润色', description: '语言/逻辑/结构/摘要', icon: 'sparkles', status: 'available' },
        { id: 'reduce', title: '智能降重', description: '同义替换、句式重组', icon: 'refresh-cw', status: 'available' },
        { id: 'format', title: '格式排版', description: '一键套用学校模板', icon: 'file-text', status: 'available' },
        { id: 'ppt', title: '答辩PPT生成', description: '自动提取关键内容', icon: 'presentation', status: 'available' },
      ]
    },
    {
      id: 'phase4',
      title: '4. 辅助工具',
      features: [
        { id: 'translate', title: '学术翻译', description: '专业术语精准翻译', icon: 'globe', status: 'coming-soon' },
        { id: 'formula', title: '公式编辑器', description: 'LaTeX公式快速编辑', icon: 'hash', status: 'coming-soon' },
        { id: 'chart', title: '图表生成', description: '数据可视化图表', icon: 'bar-chart', status: 'coming-soon' },
        { id: 'reference', title: '参考文献格式化', description: 'GB/T 7714等格式', icon: 'bookmark', status: 'available' },
        { id: 'report', title: '查重报告解读', description: '智能分析报告结果', icon: 'file-text', status: 'coming-soon' },
      ]
    }
  ]

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
    const iconClass = "w-6 h-6"
    switch (iconName) {
      case 'lightbulb':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      case 'list':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
      case 'book':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      case 'layout':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
      case 'pen-tool':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      case 'link':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      case 'check-circle':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      case 'shield':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      case 'sparkles':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
      case 'refresh-cw':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      case 'file-text':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      case 'presentation':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      case 'globe':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9m9 9v-9m0 0H3" /></svg>
      case 'hash':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
      case 'bar-chart':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
      case 'bookmark':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
      default:
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    }
  }

  const handleFeatureClick = (featureId: string) => {
    const routeMap: Record<string, string> = {
      'topic': '/topic',
      'outline': '/outline',
      'editor': '/outline',
      'paragraph': '/assistant',
      'citation': '/format',
      'standard': '/format',
      'plagiarism': '/check',
      'polish': '/assistant',
      'reduce': '/reduction',
      'format': '/format',
      'ppt': '/ppt',
      'reference': '/format',
    }
    const path = routeMap[featureId]
    if (path) {
      navigate(path)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 左侧侧边栏 */}
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

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部标题栏 */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-800">论文写作辅导系统</h1>
          <div className="ml-auto flex items-center space-x-4">
            <button
              onClick={() => navigate('/writing')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              进入写作编辑器
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
          <div className="max-w-5xl mx-auto">
            {/* 系统介绍 */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">功能架构总览</h2>
              <p className="text-gray-600 text-sm mb-4">
                本系统提供全流程论文写作支持，从选题到答辩，覆盖论文写作的各个阶段。
              </p>
            </div>

            {/* 阶段标签 */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {phases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activePhase === phase.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {phase.title}
                </button>
              ))}
            </div>

            {/* 功能卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phases.find(p => p.id === activePhase)?.features.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => feature.status === 'available' && handleFeatureClick(feature.id)}
                  className={`bg-white rounded-lg p-5 shadow-sm border-2 transition-all ${
                    feature.status === 'available'
                      ? 'border-transparent hover:border-blue-300 hover:shadow-md cursor-pointer'
                      : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      feature.status === 'available' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {renderIcon(feature.icon)}
                    </div>
                    {feature.status === 'coming-soon' && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                        即将上线
                      </span>
                    )}
                    {feature.status === 'available' && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                        可用
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* 快速入口 */}
            <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">快速入口</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/topic')}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">
                    {renderIcon('lightbulb')}
                  </div>
                  <span className="text-sm font-medium text-gray-700">选题灵感</span>
                </button>
                <button
                  onClick={() => navigate('/outline')}
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                    {renderIcon('list')}
                  </div>
                  <span className="text-sm font-medium text-gray-700">智能大纲</span>
                </button>
                <button
                  onClick={() => navigate('/assistant')}
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white mb-2">
                    {renderIcon('pen-tool')}
                  </div>
                  <span className="text-sm font-medium text-gray-700">写作助手</span>
                </button>
                <button
                  onClick={() => navigate('/format')}
                  className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white mb-2">
                    {renderIcon('file-text')}
                  </div>
                  <span className="text-sm font-medium text-gray-700">格式规范</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default WritingTutoring
