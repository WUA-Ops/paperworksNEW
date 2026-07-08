/**
 * FormatStandardization页面 - 格式规范化页面
 * 基于GB/T 7713.1-2006 标准自动检查论文格式，支持一键修复、模板管理、批量处理等功能
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPaper } from '../api/essay'
import AuthModal from '../components/AuthModal'

interface FormatRule {
  id: number
  category: string
  name: string
  description: string
  status: 'pass' | 'warning' | 'error'
  autoFix: boolean
}

interface Template {
  id: number
  name: string
  standard: string
  description: string
  isDefault: boolean
}

/**
 * FormatStandardization页面主函数组件
 * @returns 格式规范化页面布局
 */
function FormatStandardization() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState(1)
  const [isChecking, setIsChecking] = useState(false)
  const [checkProgress, setCheckProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [formatContent, setFormatContent] = useState('')
  const [formattedResult, setFormattedResult] = useState('')
  const [isFormatting, setIsFormatting] = useState(false)

  const sidebarItems = [
    { id: 'topic', name: '选题灵感', icon: 'lightbulb', path: '/topic' },
    { id: 'proposal', name: '开题报告', icon: 'file-text', path: '/proposal' },
    { id: 'outline', name: '智能大纲', icon: 'list', path: '/outline' },
    { id: 'writing', name: '辅助写作', icon: 'pen-tool', path: '/writing-tutoring' },
    { id: 'format', name: '格式规范化', icon: 'layout', path: '/format' },
    { id: 'check', name: '论文查重', icon: 'search', path: '/check' },
    { id: 'reduction', name: '智能降重', icon: 'refresh-cw', path: '/reduction' },
    { id: 'aigc', name: 'AIGC检测', icon: 'shield', path: '/aigc' },
    { id: 'ai-reduction', name: '智能降AI', icon: 'cpu', path: '/ai-reduction' },
    { id: 'answer', name: 'AI生成答辩文稿', icon: 'file-text', path: '/answer' },
    { id: 'ppt', name: 'AI生成答辩PPT', icon: 'presentation', path: '/ppt' },
    { id: 'tutor', name: 'AI模拟导师', icon: 'user-circle', path: '/tutor' },
  ]

  const templates: Template[] = [
    { id: 1, name: 'GB/T 7713.1-2006', standard: '中国国家标准', description: '学位论文编写规则，适用于本科、硕士、博士学位论文', isDefault: true },
    { id: 2, name: 'APA 格式', standard: '美国心理学会', description: '社会科学领域广泛使用的论文格式标准', isDefault: false },
    { id: 3, name: 'MLA 格式', standard: '现代语言协会', description: '人文科学领域常用的论文格式标准', isDefault: false },
    { id: 4, name: 'Chicago 格式', standard: '芝加哥大学出版社', description: '历史学等领域常用的论文格式标准', isDefault: false },
  ]

  const formatRules: FormatRule[] = [
    { id: 1, category: '结构规范', name: '封面格式', description: '论文封面应包含题目、作者、指导教师、学校等信息', status: 'pass', autoFix: true },
    { id: 2, category: '结构规范', name: '目录格式', description: '目录应包含章节标题和页码，层级清晰', status: 'warning', autoFix: true },
    { id: 3, category: '结构规范', name: '摘要格式', description: '中英文摘要应包含关键词，字数符合要求', status: 'pass', autoFix: false },
    { id: 4, category: '字体字号', name: '正文字体', description: '正文应使用宋体小四号字（12pt）', status: 'error', autoFix: true },
    { id: 5, category: '字体字号', name: '标题字体', description: '一级标题使用黑体三号字（16pt）', status: 'warning', autoFix: true },
    { id: 6, category: '字体字号', name: '图表标题', description: '图表标题使用黑体五号字（10.5pt）', status: 'pass', autoFix: true },
    { id: 7, category: '段落格式', name: '行距设置', description: '正文行距应为1.5倍或固定值20磅', status: 'error', autoFix: true },
    { id: 8, category: '段落格式', name: '段落缩进', description: '首行缩进应为2个字符', status: 'pass', autoFix: true },
    { id: 9, category: '页面设置', name: '页边距', description: '上下边距2.54cm，左右边距3.17cm', status: 'warning', autoFix: true },
    { id: 10, category: '页面设置', name: '页眉页脚', description: '页眉居中显示论文题目，页脚显示页码', status: 'pass', autoFix: true },
    { id: 11, category: '参考文献', name: '引用格式', description: '参考文献应按GB/T 7714标准格式编排', status: 'error', autoFix: false },
    { id: 12, category: '参考文献', name: '文献编号', description: '文献应按引用顺序编号，格式统一', status: 'warning', autoFix: true },
    { id: 13, category: '图表公式', name: '图表编号', description: '图表应按章节编号，如"图1-1"、"表2-1"', status: 'pass', autoFix: true },
    { id: 14, category: '图表公式', name: '公式格式', description: '公式应使用公式编辑器编写，编号右对齐', status: 'warning', autoFix: false },
  ]

  const categories = ['全部', '结构规范', '字体字号', '段落格式', '页面设置', '参考文献', '图表公式']
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const filteredRules = selectedCategory === '全部' 
    ? formatRules 
    : formatRules.filter(rule => rule.category === selectedCategory)

  const stats = {
    total: formatRules.length,
    pass: formatRules.filter(r => r.status === 'pass').length,
    warning: formatRules.filter(r => r.status === 'warning').length,
    error: formatRules.filter(r => r.status === 'error').length,
    autoFixable: formatRules.filter(r => r.autoFix).length
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
      case 'layout':
        return <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass':
        return '通过'
      case 'warning':
        return '警告'
      case 'error':
        return '错误'
      default:
        return ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const handleCheck = () => {
    setIsChecking(true)
    setCheckProgress(0)
    const interval = setInterval(() => {
      setCheckProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsChecking(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleFixAll = async () => {
    if (!formatContent.trim()) {
      alert('请先输入需要格式化的内容')
      return
    }

    setIsFormatting(true)
    setFormattedResult('')

    try {
      const formatMap: Record<number, 'gbt7714' | 'apa' | 'mla' | 'chicago'> = {
        1: 'gbt7714',
        2: 'apa',
        3: 'mla',
        4: 'chicago'
      }

      const result = await formatPaper({
        content: formatContent,
        format: formatMap[selectedTemplate] || 'gbt7714',
        type: 'reference'
      })

      setFormattedResult(result)
      alert('格式化完成！')
    } catch (error) {
      console.error('格式化失败:', error)
      alert('格式化失败，请重试')
    } finally {
      setIsFormatting(false)
    }
  }

  const handleApplyTemplate = () => {
    alert(`已应用${templates.find(t => t.id === selectedTemplate)?.name} 模板！`)
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
                item.id === 'format'
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
        {/* 顶部标题�?*/}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-800">格式规范化</h1>
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
            {/* 统计卡片 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    <p className="text-sm text-gray-500">检查项总数</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.pass}</p>
                    <p className="text-sm text-gray-500">通过数</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                    <p className="text-sm text-gray-500">警告数</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.error}</p>
                    <p className="text-sm text-gray-500">错误数</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCheck}
                  disabled={isChecking}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isChecking ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>检查中 {checkProgress}%</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>开始检查</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleFixAll}
                  className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>一键修复({stats.autoFixable}项可修复)</span>
                </button>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{showPreview ? '隐藏预览' : '实时预览'}</span>
              </button>
            </div>

            {/* 进度条 */}
            {isChecking && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${checkProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-6">
              {/* 左侧 - 格式检查 */}
              <div className={`${showPreview ? 'w-1/2' : 'w-full'}`}>
                {/* 分类筛选 */}
                <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* 规则列表 */}
                <div className="space-y-3">
                  {filteredRules.map((rule) => (
                    <div key={rule.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(rule.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-800">{rule.name}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(rule.status)}`}>
                                {getStatusText(rule.status)}
                              </span>
                              {rule.autoFix && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                                  可自动修复
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                            <p className="text-xs text-gray-400 mt-1">分类：{rule.category}</p>
                          </div>
                        </div>
                        {rule.autoFix && rule.status !== 'pass' && (
                          <button className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 transition-colors">
                            修复
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧 - 模板预览 */}
              {showPreview && (
                <div className="w-1/2">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">模板管理</h2>
                    
                    {/* 模板列表 */}
                    <div className="space-y-3 mb-6">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-800">{template.name}</h3>
                              <p className="text-sm text-gray-500">{template.standard}</p>
                              <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                            </div>
                            {template.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                                默认
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleApplyTemplate}
                      className="w-full flex items-center justify-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span>应用选中模板</span>
                    </button>

                    {/* 格式参数预览 */}
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-800 mb-3">格式参数预览</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">正文字体</span>
                          <span className="font-medium">宋体 12pt</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">标题字体</span>
                          <span className="font-medium">黑体 16pt</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">行距</span>
                          <span className="font-medium">1.5倍行距</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">页边距</span>
                          <span className="font-medium">上下2.54cm，左右3.17cm</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">段落缩进</span>
                          <span className="font-medium">首行缩进2字符</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">参考文献格式</span>
                          <span className="font-medium">GB/T 7714</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default FormatStandardization
