/**
 * PaperCheck页面 - 论文查重
 * 集成 DeepSeek API，AI 智能分析论文重复率
 * 支持文本粘贴和文件上传，展示查重率、重复片段和修改建议
 */
import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkPlagiarism } from '../api/essay'
import type { DeepSeekError } from '../api/ai'
import AuthModal from '../components/AuthModal'
import { parseDocx } from '../utils/parseDocx'

interface CheckResult {
  rate: number
  level: string
  repeated: Array<{
    text: string
    reason: string
    suggestion: string
  }>
  suggestions: string[]
}

function PaperCheck() {
  const navigate = useNavigate()
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [isParsingDocx, setIsParsingDocx] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MIN_WORDS = 500

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

  const getRateColor = (rate: number) => {
    if (rate < 15) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500', bar: 'bg-green-500', label: '安全' }
    if (rate < 30) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-500', bar: 'bg-yellow-500', label: '警告' }
    return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-500', bar: 'bg-red-500', label: '危险' }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    setWordCount(text.length)
    if (result) setResult(null)
  }

  const handleCheck = async () => {
    // 检查是否有内容可以查重
    if (wordCount < MIN_WORDS && !uploadedFile) {
      setError('请输入至少500字的内容或上传文档')
      return
    }

    // 如果文本内容不足500字
    if (wordCount < MIN_WORDS) {
      setError('内容不足500字，请输入更多内容')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await checkPlagiarism({ content })
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
            setError(deepErr.message || '查重失败，请稍后重试')
        }
      } else {
        setError('查重失败，请稍后重试')
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
    setUploadedFile(null)
    setUploadStatus('idle')
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/x-rar-compressed',
    'application/zip',
    'application/x-zip-compressed',
  ]
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.rar', '.zip']

  const validateFile = (file: File): boolean => {
    const isValidType = allowedTypes.includes(file.type)
    const hasValidExtension = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    return isValidType || hasValidExtension
  }

  const processFile = async (file: File) => {
    if (!validateFile(file)) {
      setUploadStatus('error')
      return
    }
    setUploadedFile(file)
    if (file.name.toLowerCase().endsWith('.docx')) {
      setUploadStatus('uploading')
      setIsParsingDocx(true)
      try {
        const { text, wordCount: wc } = await parseDocx(file)
        setContent(text)
        setWordCount(wc)
        setUploadStatus('success')
      } catch (err) {
        setUploadStatus('idle')
        setError(err instanceof Error ? err.message : '文档解析失败，请重试')
      } finally {
        setIsParsingDocx(false)
      }
    } else {
      setUploadStatus('uploading')
      setTimeout(() => {
        setUploadStatus('success')
        if (file.type === 'text/plain') {
          const reader = new FileReader()
          reader.onload = (e) => {
            const text = e.target?.result as string
            setContent(text)
            setWordCount(text.length)
          }
          reader.readAsText(file)
        }
      }, 1000)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) processFile(files[0])
  }

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) processFile(files[0])
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
                item.id === 'check' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-blue-50'
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
          <h1 className="text-lg font-semibold text-gray-800">论文查重</h1>
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
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">论文查重</h2>
                      <p className="text-sm text-gray-500">AI 智能分析论文重复率，精准定位重复片段并提供修改建议</p>
                    </div>
                  </div>

                  <div className="flex space-x-6 mb-5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="inputType" value="text" checked={inputType === 'text'} onChange={() => setInputType('text')} className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">粘贴文本</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" name="inputType" value="file" checked={inputType === 'file'} onChange={() => setInputType('file')} className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">上传文档</span>
                    </label>
                  </div>

                  {inputType === 'text' ? (
                    <div className="relative">
                      <textarea
                        value={content}
                        onChange={handleTextChange}
                        placeholder="请在此输入或粘贴需要查重的论文内容（建议不少于500字）"
                        rows={10}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
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
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                        isDragging ? 'border-blue-500 bg-blue-50'
                          : uploadStatus === 'success' ? 'border-green-400 bg-green-50'
                          : uploadStatus === 'error' ? 'border-red-400 bg-red-50'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.rar,.zip" onChange={handleFileSelect} className="hidden" />
                      {uploadStatus === 'uploading' ? (
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin w-10 h-10 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <p className="text-blue-600 font-medium text-sm">{isParsingDocx ? '正在解析文档...' : '正在上传...'}</p>
                        </div>
                      ) : uploadStatus === 'success' && uploadedFile ? (
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-gray-800 font-medium text-sm mb-1">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{formatFileSize(uploadedFile.size)}</p>
                          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-2 mb-2 text-xs text-blue-700 text-center">
                            <p className="font-medium">文件上传成功！</p>
                            {wordCount > 0 ? (
                              <p className="mt-1">已提取文档内容，共 {wordCount} 字</p>
                            ) : (
                              <p className="mt-1">请将文档内容复制粘贴到下方文本框中进行查重</p>
                            )}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setUploadStatus('idle'); setWordCount(0) }} className="text-xs text-red-500 hover:text-red-700">
                            移除文件
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-gray-600 text-sm mb-1">{isDragging ? '释放以上传文件' : '点击或将文件拖拽到这里上传'}</p>
                          <p className="text-xs text-gray-400">支持 PDF、DOC、DOCX、RAR、ZIP</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">查重失败</p>
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
                    onClick={handleCheck}
                    disabled={loading || (wordCount < MIN_WORDS && !uploadedFile)}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all text-sm ${
                      loading || (wordCount < MIN_WORDS && !uploadedFile)
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
                        <span>AI 查重分析中...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>开始查重</span>
                      </>
                    )}
                  </button>
                </div>

                {loading && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">AI 正在分析你的论文</p>
                        <p className="text-xs text-blue-600 mt-1">正在检测重复片段、分析相似度、生成修改建议...</p>
                      </div>
                    </div>
                    <div className="mt-4 w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-gray-800">查重结果</h2>
                    <button onClick={handleReset} className="text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>重新查重</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className={`flex flex-col items-center justify-center w-40 h-40 rounded-2xl ${getRateColor(result.rate).bg} border ${getRateColor(result.rate).border}`}>
                      <span className={`text-5xl font-bold ${getRateColor(result.rate).text}`}>
                        {result.rate}
                      </span>
                      <span className={`text-sm font-medium mt-1 ${getRateColor(result.rate).text}`}>
                        % 重复率
                      </span>
                      <span className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRateColor(result.rate).bg} ${getRateColor(result.rate).text} border ${getRateColor(result.rate).border}`}>
                        {getRateColor(result.rate).label}
                      </span>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-gray-500">重复率</span>
                          <span className="text-xs text-gray-500">{result.rate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full transition-all ${getRateColor(result.rate).bar}`} style={{ width: `${Math.min(result.rate, 100)}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">风险等级</p>
                          <p className={`text-sm font-semibold ${getRateColor(result.rate).text}`}>{result.level || getRateColor(result.rate).label}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">重复片段</p>
                          <p className="text-sm font-semibold text-gray-800">{result.repeated?.length || 0} 处</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500 mb-1">原文总字数</p>
                          <p className="text-sm font-semibold text-gray-800">{wordCount} 字</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {result.repeated && result.repeated.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>重复片段 ({result.repeated.length})</span>
                    </h3>
                    <div className="space-y-4">
                      {result.repeated.map((item, index) => (
                        <div key={index} className="border border-red-100 bg-red-50/50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 mb-2 leading-relaxed">"{item.text}"</p>
                              <div className="flex items-start space-x-4 text-xs">
                                <div className="flex items-start space-x-1">
                                  <svg className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-gray-600"><span className="font-medium text-gray-700">原因：</span>{item.reason}</span>
                                </div>
                              </div>
                              {item.suggestion && (
                                <div className="flex items-start space-x-1 mt-1.5 text-xs">
                                  <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-green-700"><span className="font-medium">建议：</span>{item.suggestion}</span>
                                </div>
                              )}
                            </div>
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
                      <span>修改建议</span>
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
                  <button onClick={handleReset} className="flex items-center space-x-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>重新查重</span>
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

export default PaperCheck
