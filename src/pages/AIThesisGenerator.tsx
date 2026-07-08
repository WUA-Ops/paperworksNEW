/**
 * AIThesisGenerator页面 - AI生成答辩文稿页面
 * 根据提交的论文生成文稿内容
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { streamGenerateDefenseScript } from '../api/essay'
import AuthModal from '../components/AuthModal'

/**
 * AIThesisGenerator页面主函数组件
 * @returns AI生成答辩文稿页面布局
 */
function AIThesisGenerator() {
  const navigate = useNavigate()
  const [paperTitle, setPaperTitle] = useState('')
  const [keywords, setKeywords] = useState('')
  const [education, setEducation] = useState<'specialty' | 'undergraduate' | 'master'>('specialty')
  const [wordCount, setWordCount] = useState<'8000' | '12000' | '15000' | '20000'>('12000')
  const [agreed, setAgreed] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [generatedOutline, setGeneratedOutline] = useState<string[]>([])
  const [showOutline, setShowOutline] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
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

  const handleGenerate = async () => {
    if (!paperTitle.trim() || !agreed) return
    
    setIsGenerating(true)
    setGeneratedScript('')
    
    try {
      const wordCountMap: Record<string, number> = {
        '8000': 8000,
        '12000': 12000,
        '15000': 15000,
        '20000': 20000
      }

      const generator = streamGenerateDefenseScript({
        title: paperTitle,
        education: education,
        wordCount: wordCountMap[wordCount] || 12000
      })
      
      for await (const chunk of generator) {
        setGeneratedScript(prev => prev + chunk)
      }
      
      setActiveStep(2)
      setShowOutline(true)
      
      const scriptLines = generatedScript.split('\n').filter(line => line.trim())
      setGeneratedOutline(scriptLines.slice(0, 30))
    } catch (error) {
      console.error('生成答辩文稿失败:', error)
      alert('生成答辩文稿失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStepClick = (step: number) => {
    setActiveStep(step)
    if (step === 2) {
      setShowOutline(true)
    }
  }

  // 支持的文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/x-rar-compressed',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain'
  ]

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.rar', '.zip', '.txt']

  // 验证文件类型
  const validateFile = (file: File): boolean => {
    const isValidType = allowedTypes.includes(file.type)
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )
    return isValidType || hasValidExtension
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  // 处理文件
  const processFile = (file: File) => {
    if (!validateFile(file)) {
      setUploadStatus('error')
      alert('不支持的文件格式，请上传 PDF、DOC、DOCX、RAR、ZIP 或 TXT 文件')
      return
    }

    setUploadStatus('uploading')
    
    // 模拟上传过程
    setTimeout(() => {
      setUploadedFile(file)
      setUploadedFileName(file.name)
      setUploadStatus('success')
      // 自动提取文件名作为论文标题（去掉扩展名）
      const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setPaperTitle(titleWithoutExt)
    }, 1000)
  }

  // 移除已上传文件
  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadedFileName(null)
    setUploadStatus('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeywordSubmit = () => {
    if (keywords.trim()) {
      setPaperTitle(keywords)
      setActiveStep(2)
    }
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
                item.id === 'answer'
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

      {/* 中间步骤导航 */}
      <aside className="w-64 bg-blue-50/50 border-r border-blue-100 flex flex-col">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-blue-600 mb-6">答辩文稿</h2>
          
          {/* 步骤1 */}
          <div 
            onClick={() => handleStepClick(1)}
            className={`rounded-xl border p-4 mb-4 cursor-pointer transition-colors ${
              activeStep === 1 
                ? 'bg-blue-100 border-2 border-blue-300' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                activeStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>1</span>
              <span className={`text-sm ${activeStep === 1 ? 'font-medium text-blue-600' : 'text-gray-600'}`}>请输入论文关键词</span>
            </div>
            {activeStep === 1 && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="输入论文关键词，如：人工智能、机器学习..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleKeywordSubmit()
                  }}
                  disabled={!keywords.trim()}
                  className="w-full py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  确认关键词
                </button>
              </div>
            )}
          </div>

          {/* 步骤2 - AI原创性答辩文稿 */}
          <div 
            onClick={() => handleStepClick(2)}
            className={`rounded-xl border p-4 mb-4 cursor-pointer transition-colors ${
              activeStep === 2 
                ? 'bg-blue-100 border-2 border-blue-300' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                activeStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>2</span>
              <span className={`text-sm ${activeStep === 2 ? 'font-medium text-blue-600' : 'text-gray-600'}`}>AI原创性答辩文稿</span>
            </div>
            {showOutline && generatedOutline.length > 0 && (
              <div className="text-xs text-gray-600 space-y-1 pl-8 max-h-40 overflow-y-auto">
                {generatedOutline.map((item, index) => (
                  <p key={index} className={item.match(/^\d+$/) ? 'font-medium mt-2' : ''}>{item}</p>
                ))}
              </div>
            )}
            {!showOutline && activeStep === 2 && (
              <p className="text-xs text-gray-500 pl-8">点击"立即生成"按钮生成文稿大纲</p>
            )}
          </div>

          {/* 步骤3 */}
          <div 
            onClick={() => handleStepClick(3)}
            className={`rounded-xl border p-4 cursor-pointer transition-colors ${
              activeStep === 3 
                ? 'bg-blue-100 border-2 border-blue-300' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                activeStep === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>3</span>
              <span className={`text-sm ${activeStep === 3 ? 'font-medium text-blue-600' : 'text-gray-600'}`}>上传论文原稿</span>
            </div>
            {activeStep === 3 && (
              <div className="space-y-3 pl-8">
                {/* 文件上传区域 */}
                <div 
                  className="w-full border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer bg-white hover:border-blue-400 hover:bg-blue-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.rar,.zip,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {uploadStatus === 'uploading' ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin w-6 h-6 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-xs text-blue-600">正在上传...</p>
                    </div>
                  ) : uploadStatus === 'success' && uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs text-gray-700 font-medium">{uploadedFileName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile()
                        }}
                        className="text-xs text-red-500 hover:text-red-700 mt-2"
                      >
                        移除文件
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-6 h-6 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-xs text-gray-600">点击上传论文原稿</p>
                      <p className="text-xs text-gray-400">支持 .pdf .doc .docx .txt 格式</p>
                    </div>
                  )}
                </div>
                
                {uploadedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <p className="text-xs text-green-700">
                      ✓ 论文已上传成功！系统将根据您的论文内容生成答辩文稿
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col">
        {/* 顶部标题栏 */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-gray-800">AI生成文稿</h1>
          
          {/* 右侧搜索和设置 */}
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
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* 标题 */}
            <h2 className="text-xl font-bold text-gray-800 text-center mb-8">论文答辩文稿</h2>

            {/* 表单卡片 */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              {/* 论文标题输入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  提交论文标题
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    placeholder="输入5-50字论文标题，如果标题没有思路，可以试一下推荐哦~"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-4 py-3 bg-purple-100 text-purple-600 rounded-lg font-medium hover:bg-purple-200 transition-colors">
                    推荐标题
                  </button>
                </div>
              </div>

              {/* 选择学历 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">选择学历</label>
                <div className="flex space-x-8">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="education"
                      value="specialty"
                      checked={education === 'specialty'}
                      onChange={() => setEducation('specialty')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">专科</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="education"
                      value="undergraduate"
                      checked={education === 'undergraduate'}
                      onChange={() => setEducation('undergraduate')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">本科</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="education"
                      value="master"
                      checked={education === 'master'}
                      onChange={() => setEducation('master')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">硕士</span>
                  </label>
                </div>
              </div>

              {/* 选择字数 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">选择字数</label>
                <div className="flex space-x-8">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wordCount"
                      value="8000"
                      checked={wordCount === '8000'}
                      onChange={() => setWordCount('8000')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">8000字左右</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wordCount"
                      value="12000"
                      checked={wordCount === '12000'}
                      onChange={() => setWordCount('12000')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">12000字左右</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wordCount"
                      value="15000"
                      checked={wordCount === '15000'}
                      onChange={() => setWordCount('15000')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">15000字左右</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wordCount"
                      value="20000"
                      checked={wordCount === '20000'}
                      onChange={() => setWordCount('20000')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">20000字左右</span>
                  </label>
                </div>
              </div>

              {/* 同意条款 */}
              <div className="mb-8">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={() => setAgreed(!agreed)}
                    className="w-4 h-4 text-blue-600 mt-0.5"
                  />
                  <span className="text-sm text-gray-500">我已阅读并同意：生成的文稿仅用于参考，不作为毕业、发表使用</span>
                </label>
              </div>

              {/* 立即生成按钮 */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !paperTitle.trim() || !agreed}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '生成中...' : '立即生成'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default AIThesisGenerator
