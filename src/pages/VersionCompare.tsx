/**
 * VersionCompare页面 - 多版本对比页面
 * 支持版本选择、差异高亮、对比模式、版本时间线、修改统计、批注反馈、版本合并、导出报告等功能
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { compareVersions } from '../api/essay'
import AuthModal from '../components/AuthModal'

interface Version {
  id: number
  name: string
  date: string
  author: string
  wordCount: number
  description: string
}

interface DiffBlock {
  id: number
  type: 'added' | 'deleted' | 'modified'
  content: string
  oldContent?: string
  newContent?: string
  lineStart: number
  lineEnd: number
  comment?: string
  resolved: boolean
}

interface CompareStats {
  added: number
  deleted: number
  modified: number
  addedWords: number
  deletedWords: number
}

type CompareMode = 'side-by-side' | 'inline' | 'unified'

/**
 * VersionCompare页面主函数组件
 * @returns 多版本对比页面布局
 */
function VersionCompare() {
  const navigate = useNavigate()
  const [leftVersion, setLeftVersion] = useState<number | null>(null)
  const [rightVersion, setRightVersion] = useState<number | null>(null)
  const [compareMode, setCompareMode] = useState<CompareMode>('side-by-side')
  const [showTimeline, setShowTimeline] = useState(true)
  const [selectedDiff, setSelectedDiff] = useState<number | null>(null)
  const [commentInput, setCommentInput] = useState('')
  const [version1Content, setVersion1Content] = useState('')
  const [version2Content, setVersion2Content] = useState('')
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const versions: Version[] = [
    { id: 1, name: '初稿', date: '2024-03-01 10:30', author: '张三', wordCount: 8500, description: '论文初稿完成' },
    { id: 2, name: '修改稿v1', date: '2024-03-15 14:20', author: '张三', wordCount: 9200, description: '根据导师意见修改' },
    { id: 3, name: '修改稿v2', date: '2024-04-02 09:15', author: '张三', wordCount: 10500, description: '完善实验数据' },
    { id: 4, name: '修改稿v3', date: '2024-04-18 16:45', author: '张三', wordCount: 11200, description: '优化结论部分' },
    { id: 5, name: '定稿', date: '2024-05-01 11:00', author: '张三', wordCount: 12000, description: '最终版本' },
  ]

  const diffBlocks: DiffBlock[] = [
    {
      id: 1,
      type: 'modified',
      content: '研究背景',
      oldContent: '随着互联网技术的快速发展，在线教育逐渐成为教育领域的重要组成部分。',
      newContent: '随着人工智能和互联网技术的快速发展，在线教育逐渐成为教育领域的重要组成部分，并在近年来得到了广泛应用。',
      lineStart: 1,
      lineEnd: 3,
      comment: '',
      resolved: false
    },
    {
      id: 2,
      type: 'added',
      content: '新增段落',
      newContent: '本研究旨在探索基于深度学习的个性化推荐系统在在线教育平台中的应用，通过分析学生的学习行为和知识掌握情况，提供精准的学习内容推荐。',
      lineStart: 5,
      lineEnd: 7,
      comment: '这个补充很好，完善了研究目标',
      resolved: true
    },
    {
      id: 3,
      type: 'deleted',
      content: '删除段落',
      oldContent: '传统的在线教育平台往往采用统一的教学内容，无法满足不同学生的个性化需求。',
      lineStart: 8,
      lineEnd: 9,
      comment: '',
      resolved: false
    },
    {
      id: 4,
      type: 'modified',
      content: '研究方法',
      oldContent: '本研究采用问卷调查和实验对比的方法，收集学生的学习数据。',
      newContent: '本研究采用混合研究方法，结合问卷调查、实验对比和深度访谈，收集和分析学生的学习数据。',
      lineStart: 12,
      lineEnd: 14,
      comment: '',
      resolved: false
    },
    {
      id: 5,
      type: 'added',
      content: '新增章节',
      newContent: '4.3 实验结果分析\n\n实验结果表明，基于深度学习的推荐系统相比传统方法，在学生学习成绩提升方面具有显著优势。实验组学生的平均成绩提高了15.6%，学习满意度提升了23.4%。',
      lineStart: 25,
      lineEnd: 30,
      comment: '',
      resolved: false
    },
    {
      id: 6,
      type: 'modified',
      content: '结论部分',
      oldContent: '本研究验证了个性化推荐系统在在线教育中的有效性。',
      newContent: '本研究验证了基于深度学习的个性化推荐系统在在线教育中的有效性，为后续研究提供了理论基础和实践参考。',
      lineStart: 35,
      lineEnd: 37,
      comment: '结论需要更加详细',
      resolved: false
    }
  ]

  const stats: CompareStats = {
    added: diffBlocks.filter(d => d.type === 'added').length,
    deleted: diffBlocks.filter(d => d.type === 'deleted').length,
    modified: diffBlocks.filter(d => d.type === 'modified').length,
    addedWords: 450,
    deletedWords: 180
  }

  const sidebarItems = [
    { id: 'topic', name: '选题灵感', icon: 'lightbulb', path: '/topic' },
    { id: 'proposal', name: '开题报告', icon: 'file-text', path: '/proposal' },
    { id: 'outline', name: '智能大纲', icon: 'list', path: '/outline' },
    { id: 'writing', name: '辅助写作', icon: 'pen-tool', path: '/writing-tutoring' },
    { id: 'format', name: '格式规范', icon: 'layout', path: '/format' },
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

  const getDiffColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200'
      case 'deleted':
        return 'bg-red-50 border-red-200'
      case 'modified':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getDiffBadge = (type: string) => {
    switch (type) {
      case 'added':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">新增</span>
      case 'deleted':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">删除</span>
      case 'modified':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">修改</span>
      default:
        return null
    }
  }

  const handleAddComment = (diffId: number) => {
    if (commentInput.trim()) {
      alert(`已添加批注到差异块${diffId}: ${commentInput}`)
      setCommentInput('')
      setSelectedDiff(null)
    }
  }

  const handleMerge = async () => {
    if (!version1Content.trim() || !version2Content.trim()) {
      alert('请先输入两个版本的内容')
      return
    }

    setIsComparing(true)
    setComparisonResult('')

    try {
      const result = await compareVersions({
        version1: version1Content,
        version2: version2Content,
        focus: 'all'
      })

      setComparisonResult(result)
      alert('版本对比完成！')
    } catch (error) {
      console.error('版本对比失败:', error)
      alert('版本对比失败，请重试')
    } finally {
      setIsComparing(false)
    }
  }

  const handleExport = () => {
    alert('导出差异对比报告为文档！')
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
                item.id === 'compare'
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
          <h1 className="text-lg font-semibold text-gray-800">多版本对比</h1>
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

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* 版本选择 */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">版本选择</h2>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">左侧版本</label>
                  <select
                    value={leftVersion || ''}
                    onChange={(e) => setLeftVersion(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">选择版本</option>
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} - {v.date}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">右侧版本</label>
                  <select
                    value={rightVersion || ''}
                    onChange={(e) => setRightVersion(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">选择版本</option>
                    {versions.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} - {v.date}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 统计和操作栏 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-sm text-gray-600">新增: </span>
                  <span className="text-lg font-bold text-green-600">{stats.added}</span>
                  <span className="text-sm text-gray-500"> 处 (+{stats.addedWords}字)</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-sm text-gray-600">删除: </span>
                  <span className="text-lg font-bold text-red-600">{stats.deleted}</span>
                  <span className="text-sm text-gray-500"> 处 (-{stats.deletedWords}字)</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-sm text-gray-600">修改: </span>
                  <span className="text-lg font-bold text-yellow-600">{stats.modified}</span>
                  <span className="text-sm text-gray-500"> 处</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowTimeline(!showTimeline)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showTimeline ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-300'
                  }`}
                >
                  版本时间线
                </button>
                <select
                  value={compareMode}
                  onChange={(e) => setCompareMode(e.target.value as CompareMode)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="side-by-side">左右对比</option>
                  <option value="inline">行内对比</option>
                  <option value="unified">统一视图</option>
                </select>
                <button
                  onClick={handleMerge}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>合并版本</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>导出报告</span>
                </button>
              </div>
            </div>

            <div className="flex gap-6">
              {/* 版本时间线 */}
              {showTimeline && (
                <div className="w-64">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">版本历史</h3>
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
                      <div className="space-y-4">
                        {versions.map((version, index) => (
                          <div key={version.id} className="relative flex items-start space-x-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                              leftVersion === version.id || rightVersion === version.id
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'bg-white border-gray-300 text-gray-500'
                            }`}>
                              <span className="text-xs">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{version.name}</p>
                              <p className="text-xs text-gray-500">{version.date}</p>
                              <p className="text-xs text-gray-400">{version.author}</p>
                              <p className="text-xs text-gray-400">{version.wordCount}字</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 对比区域 */}
              <div className="flex-1">
                {compareMode === 'side-by-side' && (
                  <div className="flex gap-4">
                    {/* 左侧版本 */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-800">
                          {leftVersion ? versions.find(v => v.id === leftVersion)?.name : '选择版本'}
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {diffBlocks.map((diff) => (
                          <div key={`left-${diff.id}`}>
                            {diff.type === 'added' ? (
                              <div className="p-3 bg-gray-100 rounded text-gray-400 text-sm">
                                （此段为新增内容）
                              </div>
                            ) : diff.type === 'deleted' ? (
                              <div className="p-3 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-700 line-through">{diff.oldContent}</p>
                              </div>
                            ) : (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-700">{diff.oldContent}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 右侧版本 */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-800">
                          {rightVersion ? versions.find(v => v.id === rightVersion)?.name : '选择版本'}
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {diffBlocks.map((diff) => (
                          <div key={`right-${diff.id}`}>
                            {diff.type === 'added' ? (
                              <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm text-green-700">{diff.newContent}</p>
                              </div>
                            ) : diff.type === 'deleted' ? (
                              <div className="p-3 bg-gray-100 rounded text-gray-400 text-sm">
                                （此段已删除）
                              </div>
                            ) : (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-sm text-yellow-700">{diff.newContent}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {compareMode === 'inline' && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 space-y-3">
                      {diffBlocks.map((diff) => (
                        <div key={diff.id} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getDiffBadge(diff.type)}
                            <span className="text-xs text-gray-500">第{diff.lineStart}-{diff.lineEnd}行</span>
                          </div>
                          {diff.type === 'modified' && (
                            <div className="space-y-2">
                              <div className="p-3 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-700 line-through">{diff.oldContent}</p>
                              </div>
                              <div className="p-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-sm text-green-700">{diff.newContent}</p>
                              </div>
                            </div>
                          )}
                          {diff.type === 'added' && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <p className="text-sm text-green-700">{diff.newContent}</p>
                            </div>
                          )}
                          {diff.type === 'deleted' && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-700 line-through">{diff.oldContent}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {compareMode === 'unified' && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 space-y-2">
                      {diffBlocks.map((diff) => (
                        <div key={diff.id} className={`p-3 rounded border-2 ${getDiffColor(diff.type)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getDiffBadge(diff.type)}
                              <span className="text-xs text-gray-500">第{diff.lineStart}-{diff.lineEnd}行</span>
                            </div>
                            <button
                              onClick={() => setSelectedDiff(selectedDiff === diff.id ? null : diff.id)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              {diff.comment ? '查看批注' : '添加批注'}
                            </button>
                          </div>
                          {diff.type === 'modified' ? (
                            <div className="space-y-2">
                              <p className="text-sm text-red-600 line-through">- {diff.oldContent}</p>
                              <p className="text-sm text-green-600">+ {diff.newContent}</p>
                            </div>
                          ) : diff.type === 'added' ? (
                            <p className="text-sm text-green-600">+ {diff.newContent}</p>
                          ) : (
                            <p className="text-sm text-red-600 line-through">- {diff.oldContent}</p>
                          )}
                          
                          {/* 批注区域 */}
                          {selectedDiff === diff.id && (
                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                              {diff.comment && (
                                <div className="mb-2 p-2 bg-blue-50 rounded">
                                  <p className="text-sm text-blue-700">{diff.comment}</p>
                                  {diff.resolved && (
                                    <span className="text-xs text-green-600">已解决</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={commentInput}
                                  onChange={(e) => setCommentInput(e.target.value)}
                                  placeholder="添加批注..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => handleAddComment(diff.id)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                >
                                  提交
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default VersionCompare
