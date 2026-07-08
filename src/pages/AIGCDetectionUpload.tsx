/**
 * AIGCDetectionUpload页面 - AIGC检测页面（虚线框上传版本）
 * 通过智能检测技术,为论文注入原创性和真实性
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { detectAIGC } from '../api/essay'
import AuthModal from '../components/AuthModal'

/**
 * AIGCDetectionUpload页面主函数组件
 * @returns AIGC检测页面布局（虚线框上传版本）
 */
function AIGCDetectionUpload() {
  const navigate = useNavigate()
  const [paperTitle, setPaperTitle] = useState('')
  const [paperAuthor, setPaperAuthor] = useState('')
  const [paperDesc, setPaperDesc] = useState('')
  const [submitType, setSubmitType] = useState<'text' | 'upload'>('upload')
  const [textContent, setTextContent] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    setUploadedFile(file)
    setUploadedFileName(file.name)

    // 模拟上传过程
    setTimeout(() => {
      setUploadStatus('success')
    }, 1000)
  }

  // 处理拖拽进入
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  // 处理拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // 处理文件拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  // 点击上传区域
  const handleClickUpload = () => {
    fileInputRef.current?.click()
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

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleStartDetection = async () => {
    // 检查是否有内容可以检测
    if (submitType === 'text') {
      if (textContent.length < 500) {
        alert('文本内容不足500字，请输入更多内容')
        return
      }
    } else {
      if (!uploadedFile || uploadStatus !== 'success') {
        alert('请先上传文件或切换到粘贴文本模式')
        return
      }
      // 文件上传模式暂不支持，提示用户切换到粘贴文本模式
      alert('文件上传模式暂不支持直接读取文件内容。请切换到"粘贴文本"模式，将文档内容复制粘贴到文本框中进行检测。')
      return
    }
    
    setIsDetecting(true)
    
    try {
      // 调用AIGC检测API
      const result = await detectAIGC({ content: textContent })
      console.log('AIGC检测结果：', result)
      alert(`检测完成！AI生成概率：${result.aiProbability}%`)
    } catch (error) {
      console.error('AIGC检测错误：', error)
      alert('检测失败，请稍后重试')
    } finally {
      setIsDetecting(false)
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
                item.id === 'aigc'
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
          <h1 className="text-lg font-semibold text-gray-800">AIGC检测</h1>
          
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
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* 欢迎区域 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">你好，同学</h2>
                  <p className="text-gray-500 text-sm">今天想为你的毕业论文做点什么？</p>
                </div>
              </div>
            </div>

            {/* 论文AIGC检测表单 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* 表单标题 */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">论文AIGC检测</h3>
                <p className="text-gray-500 text-sm mt-1">检测双人表述，为论文注入原创性和真实性</p>
              </div>

              {/* 表单内容 */}
              <div className="p-6 space-y-4">
                {/* 论文标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">论文标题</label>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    placeholder="选填，20字以内"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 论文作者 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">论文作者</label>
                  <input
                    type="text"
                    value={paperAuthor}
                    onChange={(e) => setPaperAuthor(e.target.value)}
                    placeholder="选填，20字以内"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 论文简介 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">论文简介</label>
                  <textarea
                    value={paperDesc}
                    onChange={(e) => setPaperDesc(e.target.value)}
                    placeholder="选填，50字以内"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* 提交方式选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">提交论文</label>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="submitType"
                        value="text"
                        checked={submitType === 'text'}
                        onChange={() => setSubmitType('text')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">粘贴文本</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="submitType"
                        value="upload"
                        checked={submitType === 'upload'}
                        onChange={() => setSubmitType('upload')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">上传文档</span>
                    </label>
                  </div>
                </div>

                {/* 内容输入区域 */}
                <div className="mt-4">
                  {submitType === 'text' ? (
                    /* 文本输入区域 */
                    <div className="w-full">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              请在此输入或粘贴需要检测的论文内容
                            </span>
                            <span className="text-sm text-gray-500">
                              字数：{textContent.length}（建议不少于500字）
                            </span>
                          </div>
                        </div>
                        <textarea
                          ref={textareaRef}
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          placeholder="请在此输入或粘贴需要检测的论文内容（建议不少于500字）..."
                          className="w-full px-4 py-3 text-sm border-0 resize-none focus:outline-none focus:ring-0 min-h-[300px]"
                          rows={15}
                        />
                      </div>
                    </div>
                  ) : (
                    /* 文件上传区域 */
                    <div
                      onClick={handleClickUpload}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50'
                          : uploadStatus === 'success'
                          ? 'border-green-500 bg-green-50'
                          : uploadStatus === 'error'
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.rar,.zip,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {uploadStatus === 'uploading' ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </div>
                          <p className="text-blue-600 font-medium">正在上传...</p>
                        </div>
                      ) : uploadStatus === 'success' && uploadedFile ? (
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-800 font-medium">{uploadedFileName}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveFile()
                            }}
                            className="text-sm text-red-500 hover:text-red-700 underline"
                          >
                            移除文件
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">
                              {isDragging ? '释放以上传文件' : '点击或将文件拖拽到这里上传'}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">支持格式：.rar .zip .txt .doc .docx .pdf ...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 底部按钮区域 */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                {/* 开始检测按钮 */}
                <button
                  onClick={handleStartDetection}
                  disabled={
                    isDetecting || 
                    (submitType === 'text' ? textContent.length < 500 : !uploadedFile || uploadStatus !== 'success')
                  }
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{isDetecting ? '检测中...' : '开始检测'}</span>
                </button>

                {/* 下载报告按钮 */}
                <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>点击下载返回报告</span>
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

export default AIGCDetectionUpload
