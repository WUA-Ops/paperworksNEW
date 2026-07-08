/**
 * ProposalReport页面 - 开题报告撰写页面
 * 包含基本信息、选题背景、研究内容、研究方法、进度安排、预览提交等模块
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateProposal } from '../api/essay'
import AuthModal from '../components/AuthModal'

/**
 * ProposalReport页面主函数组件
 * @returns 开题报告撰写页面布局
 */
function ProposalReport() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [timeline, setTimeline] = useState([
    { id: 1, phase: '文献调研与资料收集', startDate: '2024-03-01', endDate: '2024-04-15' },
    { id: 2, phase: '实验设计与数据收集', startDate: '2024-04-16', endDate: '2024-06-30' },
    { id: 3, phase: '数据分析与论文撰写', startDate: '2024-07-01', endDate: '2024-09-15' },
    { id: 4, phase: '论文修改与答辩准备', startDate: '2024-09-16', endDate: '2024-11-30' }
  ])

  const [formData, setFormData] = useState({
    title: '',
    studentName: '',
    studentId: '',
    major: '',
    supervisor: '',
    background: '',
    significance: '',
    domesticStatus: '',
    internationalStatus: '',
    researchContent: '',
    keyProblems: '',
    researchGoals: '',
    innovations: '',
    methods: '',
    technicalRoute: '',
    feasibility: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedProposal, setGeneratedProposal] = useState('')
  const [proposalType, setProposalType] = useState<'undergraduate' | 'master' | 'doctoral'>('undergraduate')
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

  const steps = [
    { id: 0, name: '基本信息', icon: 'user' },
    { id: 1, name: '选题背景', icon: 'book-open' },
    { id: 2, name: '研究内容', icon: 'clipboard-list' },
    { id: 3, name: '研究方法', icon: 'beaker' },
    { id: 4, name: '进度安排', icon: 'calendar' },
    { id: 5, name: '预览提交', icon: 'eye' }
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const handleAddTimeline = () => {
    const newId = timeline.length > 0 ? Math.max(...timeline.map(t => t.id)) + 1 : 1
    setTimeline([...timeline, { id: newId, phase: '', startDate: '', endDate: '' }])
  }

  const handleRemoveTimeline = (id: number) => {
    setTimeline(timeline.filter(t => t.id !== id))
  }

  const handleTimelineChange = (id: number, field: string, value: string) => {
    setTimeline(timeline.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const getWordCount = (text: string) => text.length

  const handleGenerateProposal = async () => {
    if (!formData.title.trim()) {
      alert('请先输入论文题目')
      return
    }

    setIsGenerating(true)
    setGeneratedProposal('')

    try {
      const result = await generateProposal({
        topic: formData.title,
        background: formData.background,
        type: proposalType
      })
      
      setGeneratedProposal(result)
    } catch (error) {
      console.error('生成开题报告失败:', error)
      alert('生成开题报告失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplyProposal = () => {
    if (!generatedProposal) return
    
    const sections = generatedProposal.split('\n\n')
    sections.forEach(section => {
      if (section.includes('选题背景')) {
        setFormData(prev => ({ ...prev, background: section }))
      } else if (section.includes('研究意义')) {
        setFormData(prev => ({ ...prev, significance: section }))
      } else if (section.includes('国内研究现状')) {
        setFormData(prev => ({ ...prev, domesticStatus: section }))
      } else if (section.includes('国外研究现状')) {
        setFormData(prev => ({ ...prev, internationalStatus: section }))
      } else if (section.includes('研究内容')) {
        setFormData(prev => ({ ...prev, researchContent: section }))
      } else if (section.includes('研究方法')) {
        setFormData(prev => ({ ...prev, methods: section }))
      }
    })
    
    alert('已将生成的开题报告内容应用到表单中')
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
                item.id === 'proposal'
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
          <h1 className="text-lg font-semibold text-gray-800">开题报告</h1>
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

        {/* 进度条 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-purple-500 text-white'
                      : currentStep > step.id
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="text-sm font-medium">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-purple-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* 基本信息 */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">基本信息</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">论文题目</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="请输入论文题目"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">学生姓名</label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) => handleInputChange('studentName', e.target.value)}
                      placeholder="请输入学生姓名"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">学号</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder="请输入学号"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">专业</label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => handleInputChange('major', e.target.value)}
                      placeholder="请输入专业"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">指导教师</label>
                    <input
                      type="text"
                      value={formData.supervisor}
                      onChange={(e) => handleInputChange('supervisor', e.target.value)}
                      placeholder="请输入指导教师姓名"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 关键词标签 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                      placeholder="输入关键词后按回车添加"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-2 text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 选题背景 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">选题背景</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究背景
                    <span className="text-gray-400 ml-2">({getWordCount(formData.background)}字)</span>
                  </label>
                  <textarea
                    value={formData.background}
                    onChange={(e) => handleInputChange('background', e.target.value)}
                    placeholder="请描述研究背景..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究意义
                    <span className="text-gray-400 ml-2">({getWordCount(formData.significance)}字)</span>
                  </label>
                  <textarea
                    value={formData.significance}
                    onChange={(e) => handleInputChange('significance', e.target.value)}
                    placeholder="请描述研究意义..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    国内研究现状
                    <span className="text-gray-400 ml-2">({getWordCount(formData.domesticStatus)}字)</span>
                  </label>
                  <textarea
                    value={formData.domesticStatus}
                    onChange={(e) => handleInputChange('domesticStatus', e.target.value)}
                    placeholder="请描述国内研究现状..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    国外研究现状
                    <span className="text-gray-400 ml-2">({getWordCount(formData.internationalStatus)}字)</span>
                  </label>
                  <textarea
                    value={formData.internationalStatus}
                    onChange={(e) => handleInputChange('internationalStatus', e.target.value)}
                    placeholder="请描述国外研究现状..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {/* 研究内容 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">研究内容</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主要内容
                    <span className="text-gray-400 ml-2">({getWordCount(formData.researchContent)}字)</span>
                  </label>
                  <textarea
                    value={formData.researchContent}
                    onChange={(e) => handleInputChange('researchContent', e.target.value)}
                    placeholder="请描述研究的主要内容..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    关键问题
                    <span className="text-gray-400 ml-2">({getWordCount(formData.keyProblems)}字)</span>
                  </label>
                  <textarea
                    value={formData.keyProblems}
                    onChange={(e) => handleInputChange('keyProblems', e.target.value)}
                    placeholder="请描述研究的关键问题..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究目标
                    <span className="text-gray-400 ml-2">({getWordCount(formData.researchGoals)}字)</span>
                  </label>
                  <textarea
                    value={formData.researchGoals}
                    onChange={(e) => handleInputChange('researchGoals', e.target.value)}
                    placeholder="请描述研究目标..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    创新点
                    <span className="text-gray-400 ml-2">({getWordCount(formData.innovations)}字)</span>
                  </label>
                  <textarea
                    value={formData.innovations}
                    onChange={(e) => handleInputChange('innovations', e.target.value)}
                    placeholder="请描述研究的创新点..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {/* 研究方法 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">研究方法</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    研究方法
                    <span className="text-gray-400 ml-2">({getWordCount(formData.methods)}字)</span>
                  </label>
                  <textarea
                    value={formData.methods}
                    onChange={(e) => handleInputChange('methods', e.target.value)}
                    placeholder="请描述研究方法..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    技术路线
                    <span className="text-gray-400 ml-2">({getWordCount(formData.technicalRoute)}字)</span>
                  </label>
                  <textarea
                    value={formData.technicalRoute}
                    onChange={(e) => handleInputChange('technicalRoute', e.target.value)}
                    placeholder="请描述技术路线..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    可行性分析
                    <span className="text-gray-400 ml-2">({getWordCount(formData.feasibility)}字)</span>
                  </label>
                  <textarea
                    value={formData.feasibility}
                    onChange={(e) => handleInputChange('feasibility', e.target.value)}
                    placeholder="请描述可行性分析..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {/* 进度安排 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">进度安排</h2>
                  <button
                    onClick={handleAddTimeline}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加阶段</span>
                  </button>
                </div>

                {/* 时间线 */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-200" />
                  <div className="space-y-6">
                    {timeline.map((item) => (
                      <div key={item.id} className="relative flex items-start space-x-4 pl-8">
                        <div className="absolute left-2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow" />
                        <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">阶段名称</label>
                              <input
                                type="text"
                                value={item.phase}
                                onChange={(e) => handleTimelineChange(item.id, 'phase', e.target.value)}
                                placeholder="请输入阶段名称"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                              <input
                                type="date"
                                value={item.startDate}
                                onChange={(e) => handleTimelineChange(item.id, 'startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                              <input
                                type="date"
                                value={item.endDate}
                                onChange={(e) => handleTimelineChange(item.id, 'endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveTimeline(item.id)}
                            className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 预览提交 */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">预览提交</h2>
                
                {/* AI生成开题报告 */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="text-lg font-medium text-purple-700">AI智能生成开题报告</h3>
                    </div>
                    <select
                      value={proposalType}
                      onChange={(e) => setProposalType(e.target.value as 'undergraduate' | 'master' | 'doctoral')}
                      className="px-3 py-1 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="undergraduate">本科</option>
                      <option value="master">硕士</option>
                      <option value="doctoral">博士</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGenerating || !formData.title.trim()}
                    className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>一键生成开题报告</span>
                      </>
                    )}
                  </button>
                  
                  {generatedProposal && (
                    <div className="mt-4 space-y-3">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2">生成结果预览</h4>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
                          {generatedProposal}
                        </div>
                      </div>
                      <button
                        onClick={handleApplyProposal}
                        className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        应用到表单
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">开题报告</h3>
                    <p className="text-gray-600">{formData.title || '（未填写论文题目）'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><span className="font-medium">学生姓名：</span>{formData.studentName || '（未填写）'}</div>
                    <div><span className="font-medium">学号：</span>{formData.studentId || '（未填写）'}</div>
                    <div><span className="font-medium">专业：</span>{formData.major || '（未填写）'}</div>
                    <div><span className="font-medium">指导教师：</span>{formData.supervisor || '（未填写）'}</div>
                  </div>

                  <div className="mb-4">
                    <span className="font-medium">关键词：</span>
                    {keywords.length > 0 ? keywords.join('、') : '（未添加关键词）'}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">一、选题背景</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p><span className="font-medium">研究背景：</span>{formData.background || '（未填写）'}</p>
                        <p><span className="font-medium">研究意义：</span>{formData.significance || '（未填写）'}</p>
                        <p><span className="font-medium">国内现状：</span>{formData.domesticStatus || '（未填写）'}</p>
                        <p><span className="font-medium">国外现状：</span>{formData.internationalStatus || '（未填写）'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">二、研究内容</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p><span className="font-medium">主要内容：</span>{formData.researchContent || '（未填写）'}</p>
                        <p><span className="font-medium">关键问题：</span>{formData.keyProblems || '（未填写）'}</p>
                        <p><span className="font-medium">研究目标：</span>{formData.researchGoals || '（未填写）'}</p>
                        <p><span className="font-medium">创新点：</span>{formData.innovations || '（未填写）'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">三、研究方法</h4>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p><span className="font-medium">研究方法：</span>{formData.methods || '（未填写）'}</p>
                        <p><span className="font-medium">技术路线：</span>{formData.technicalRoute || '（未填写）'}</p>
                        <p><span className="font-medium">可行性分析：</span>{formData.feasibility || '（未填写）'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">四、进度安排</h4>
                      <div className="text-sm text-gray-600">
                        {timeline.map((item) => (
                          <p key={item.id}>
                            {item.phase}：{item.startDate} 至 {item.endDate}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button className="flex items-center space-x-2 bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-colors text-lg font-medium">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>提交开题报告</span>
                  </button>
                </div>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一步
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
              </button>
            </div>
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default ProposalReport
