/**
 * AIPPTGenerator页面 - AI生成答辩PPT页面
 * 通过上传论文内容，选择PPT模版生成答辩PPT
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { streamGeneratePPT } from '../api/essay'
import AuthModal from '../components/AuthModal'
import { parseDocx } from '../utils/parseDocx'

// 导入本地PPT模板封面图片
import minimalistImg from '../assets/templates/minimalist.jpg'
import formalImg from '../assets/templates/formal.jpg'
import elegantImg from '../assets/templates/elegant.jpg'
import youthfulImg from '../assets/templates/youthful.jpg'
import modernImg from '../assets/templates/modern.jpg'
import natureImg from '../assets/templates/nature.jpg'
import techImg from '../assets/templates/tech.jpg'
import chineseImg from '../assets/templates/chinese.jpg'

/**
 * AIPPTGenerator页面主函数组件
 * @returns AI生成答辩PPT页面布局
 */
function AIPPTGenerator() {
  const navigate = useNavigate()
  const [version, setVersion] = useState<'basic' | 'advanced'>('basic')
  const [inputType, setInputType] = useState<'upload' | 'input'>('upload')
  const [templateType, setTemplateType] = useState<'basic' | 'advanced'>('advanced')
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [paperTitle, setPaperTitle] = useState('')
  const [paperContent, setPaperContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [error, setError] = useState('')
  const [isParsingDocx, setIsParsingDocx] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sidebarItems = [
    { id: 'topic', name: '选题灵感', icon: 'lightbulb', path: '/topic' },
    { id: 'proposal', name: '开题报告', icon: 'file-text', path: '/proposal' },
    { id: 'outline', name: '智能大纲', icon: 'list', path: '/outline' },
    { id: 'writing', name: '辅助写作', icon: 'pen-tool', path: '/assistant' },
    { id: 'check', name: '论文查重', icon: 'search', path: '/check' },
    { id: 'reduction', name: '智能降重', icon: 'refresh-cw', path: '/reduction' },
    { id: 'aigc', name: 'AIGC检测', icon: 'shield', path: '/aigc' },
    { id: 'ai-reduction', name: '智能降AI', icon: 'cpu', path: '/ai-reduction' },
    { id: 'answer', name: 'AI生成答辩文稿', icon: 'file-text', path: '/answer' },
    { id: 'ppt', name: 'AI生成答辩PPT', icon: 'presentation', path: '/ppt' },
    { id: 'tutor', name: 'AI模拟导师', icon: 'user-circle', path: '/tutor' },
  ]

  const templates = [
    { id: 1, name: '学术简约', style: 'minimalist', image: minimalistImg, description: '简洁大方，适合学术答辩' },
    { id: 2, name: '商务正式', style: 'formal', image: formalImg, description: '商务风格，正式场合首选' },
    { id: 3, name: '金色典雅', style: 'elegant', image: elegantImg, description: '典雅高贵，彰显学术成就' },
    { id: 4, name: '青春活力', style: 'youthful', image: youthfulImg, description: '色彩丰富，充满创意活力' },
    { id: 5, name: '几何现代', style: 'modern', image: modernImg, description: '现代几何，科技感十足' },
    { id: 6, name: '自然清新', style: 'nature', image: natureImg, description: '自然清新，舒适视觉体验' },
    { id: 7, name: '科技感', style: 'tech', image: techImg, description: '未来科技，数字化风格' },
    { id: 8, name: '中国风', style: 'chinese', image: chineseImg, description: '传统水墨，东方美学' },
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

  // 修复问题1：真实的文件上传处理
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ]
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      setError('不支持该文件格式，请上传 .pdf .doc .docx .txt .zip .rar 格式的文件')
      setUploadStatus('error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB')
      setUploadStatus('error')
      return
    }

    setUploadedFile(file)
    setError('')

    // 自动提取文件名作为论文标题（去掉扩展名）
    if (!paperTitle.trim()) {
      const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setPaperTitle(titleWithoutExt)
    }

    if (file.name.toLowerCase().endsWith('.docx')) {
      setUploadStatus('success')
      setIsParsingDocx(true)
      try {
        const { text } = await parseDocx(file)
        setPaperContent(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : '文档解析失败，请重试')
      } finally {
        setIsParsingDocx(false)
      }
    } else {
      setUploadStatus('success')
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 修复问题4+5：使用流式API，传递模板和版本信息
  const handleGeneratePPT = async () => {
    // 修复问题2：完整的验证逻辑
    if (!paperTitle.trim()) {
      setError('请输入论文标题')
      return
    }

    if (inputType === 'upload' && !uploadedFile) {
      setError('请上传论文文件')
      return
    }

    if (inputType === 'input' && !paperContent.trim()) {
      setError('请输入论文内容摘要')
      return
    }

    setIsGenerating(true)
    setError('')
    setStreamContent('')

    try {
      const generator = streamGeneratePPT({
        title: paperTitle,
        content: paperContent || '论文内容摘要',
        slidesCount: 15,
        template: templates[selectedTemplate].name,
        version: version,
      })

      for await (const chunk of generator) {
        setStreamContent(prev => prev + chunk)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      if (errorMessage.includes('余额不足')) {
        setError('API 余额不足，请联系管理员充值')
      } else if (errorMessage.includes('认证失败') || errorMessage.includes('401')) {
        setError('API 认证失败，请检查 API Key 配置')
      } else if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
        setError('请求超时，请稍后重试')
      } else if (errorMessage.includes('频繁') || errorMessage.includes('429')) {
        setError('请求过于频繁，请稍后再试')
      } else {
        setError('生成PPT失败：' + errorMessage)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // 修复问题2：完整的按钮禁用条件
  const isButtonDisabled = isGenerating || !paperTitle.trim() || 
    (inputType === 'upload' ? !uploadedFile : !paperContent.trim())

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
                item.id === 'ppt'
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
          <h1 className="text-lg font-semibold text-gray-800">AI生成答辩PPT</h1>
          
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
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* 修复问题3：使用友好提示替代alert */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
                <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              {/* 选择版本 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">选择版本：</label>
                <div className="flex space-x-6">
                  <button
                    onClick={() => setVersion('basic')}
                    className={`px-8 py-4 rounded-lg border-2 transition-all ${
                      version === 'basic'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg font-semibold text-gray-800">基础版</div>
                    <div className="text-sm text-gray-500">(仅PPT)</div>
                  </button>
                  <button
                    onClick={() => setVersion('advanced')}
                    className={`px-8 py-4 rounded-lg border-2 transition-all ${
                      version === 'advanced'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg font-semibold text-gray-800">进阶版</div>
                    <div className="text-sm text-gray-500">(PPT+备注)</div>
                  </button>
                </div>
              </div>

              {/* 输入内容 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">输入内容：</label>
                <div className="flex space-x-6 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inputType"
                      value="upload"
                      checked={inputType === 'upload'}
                      onChange={() => setInputType('upload')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">上传论文生成</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inputType"
                      value="input"
                      checked={inputType === 'input'}
                      onChange={() => setInputType('input')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">输入内容生成</span>
                  </label>
                </div>

                {/* 论文标题输入 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">论文标题</label>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    placeholder="请输入论文标题"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {inputType === 'upload' ? (
                  <div>
                    {/* 修复问题1：真实的文件上传 */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                        uploadStatus === 'success'
                          ? 'border-green-400 bg-green-50'
                          : uploadStatus === 'error'
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {uploadStatus === 'success' && uploadedFile ? (
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-gray-800 font-medium text-sm mb-1">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{formatFileSize(uploadedFile.size)}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile() }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            移除文件
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <p className="text-gray-600">点击上传论文</p>
                          <p className="text-sm text-gray-400">支持格式：.pdf .doc .docx .txt 大小不超过10M</p>
                        </div>
                      )}
                    </div>
                    {uploadStatus === 'success' && isParsingDocx && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-xs text-blue-700">正在解析文档内容...</span>
                        </div>
                      </div>
                    )}
                    {uploadStatus === 'success' && !isParsingDocx && paperContent && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs text-green-700">文档解析成功！已提取 {paperContent.length} 字内容</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">论文内容摘要</label>
                    <textarea
                      value={paperContent}
                      onChange={(e) => setPaperContent(e.target.value)}
                      placeholder="请输入论文的主要内容摘要，内容越详细生成的PPT大纲越精准..."
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="mt-1 text-xs text-gray-400 text-right">
                      已输入 {paperContent.length} 字
                    </div>
                  </div>
                )}
              </div>

              {/* 输入模版 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">输入模版：</label>
                <div className="flex space-x-6 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="templateType"
                      value="basic"
                      checked={templateType === 'basic'}
                      onChange={() => setTemplateType('basic')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">基础模版</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="templateType"
                      value="advanced"
                      checked={templateType === 'advanced'}
                      onChange={() => setTemplateType('advanced')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">进阶模版</span>
                  </label>
                </div>

                {/* 模版选择网格 */}
                <div className="grid grid-cols-4 gap-4">
                  {templates.map((template, index) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(index)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all group ${
                        selectedTemplate === index
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                    >
                      <div className="w-full h-full bg-white flex flex-col">
                        <div className="flex-1 relative overflow-hidden">
                          <img
                            src={template.image}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                            <p className="text-white text-xs font-medium">论文题目</p>
                            <p className="text-white/80 text-xs mt-0.5">答辩人：XXX</p>
                          </div>
                        </div>
                        <div className="h-8 bg-white border-t border-gray-100 flex items-center px-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
                          <span className="text-xs text-gray-600 truncate">{template.name}</span>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-white p-2">
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs mt-1">{template.description}</p>
                        </div>
                      </div>
                      
                      {selectedTemplate === index && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {selectedTemplate >= 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          已选择：{templates[selectedTemplate].name}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {templates[selectedTemplate].description}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {templates[selectedTemplate].style}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 生成按钮 */}
              <div className="mt-8">
                <button
                  onClick={handleGeneratePPT}
                  disabled={isButtonDisabled}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>AI 生成中...</span>
                    </>
                  ) : (
                    <span>立即生成PPT</span>
                  )}
                </button>
                
                {/* 修复问题4：流式输出显示 */}
                {(streamContent || isGenerating) && (
                  <div className="mt-6 bg-white rounded-lg p-6 border border-blue-200 bg-blue-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-800">
                        PPT大纲
                        {isGenerating && <span className="ml-2 text-sm text-blue-500 animate-pulse">正在生成...</span>}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto bg-white p-4 rounded-lg border border-gray-100">
                      {streamContent || '正在连接AI，请稍候...'}
                    </div>
                    {!isGenerating && streamContent && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-green-600">生成完成！</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(streamContent)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>复制全文</span>
                        </button>
                      </div>
                    )}
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

export default AIPPTGenerator
