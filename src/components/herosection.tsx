import { useNavigate } from 'react-router-dom'

/**
 * HeroSection组件 - 主页核心内容区域
 * 功能导航首页，展示所有功能入口
 */
const HeroSection = () => {
  const navigate = useNavigate()

  const features = [
    { id: 1, name: '选题灵感', icon: 'lightbulb', path: '/topic', description: 'AI智能推荐毕业论文选题', color: 'yellow' },
    { id: 2, name: '开题报告', icon: 'file-text', path: '/proposal', description: '一键生成完整开题报告', color: 'blue' },
    { id: 3, name: '智能大纲', icon: 'list', path: '/outline', description: '自动生成论文结构大纲', color: 'green' },
    { id: 4, name: '辅助写作', icon: 'pen-tool', path: '/writing-tutoring', description: 'AI辅助论文内容撰写', color: 'purple' },
    { id: 5, name: '格式规范化', icon: 'layout', path: '/format', description: '一键规范论文引用格式', color: 'indigo' },
    { id: 6, name: '论文查重', icon: 'search', path: '/check', description: '智能检测论文重复率', color: 'orange' },
    { id: 7, name: '智能降重', icon: 'refresh-cw', path: '/reduction', description: 'AI改写降低重复率', color: 'red' },
    { id: 8, name: 'AIGC检测', icon: 'shield', path: '/aigc', description: '检测AI生成内容概率', color: 'cyan' },
    { id: 9, name: '智能降AI', icon: 'cpu', path: '/ai-reduction', description: '降低AI生成痕迹', color: 'pink' },
    { id: 10, name: '答辩PPT', icon: 'presentation', path: '/ppt', description: 'AI生成答辩演示文稿', color: 'teal' },
    { id: 11, name: 'AI答辩导师', icon: 'user-circle', path: '/tutor', description: '模拟答辩问答训练', color: 'emerald' },
    { id: 12, name: '多版本对比', icon: 'git-compare', path: '/compare', description: '对比论文版本差异', color: 'violet' },
  ]

  const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', hover: 'hover:border-yellow-400' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', hover: 'hover:border-blue-400' },
    green: { bg: 'bg-green-500', text: 'text-green-500', hover: 'hover:border-green-400' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', hover: 'hover:border-purple-400' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', hover: 'hover:border-indigo-400' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', hover: 'hover:border-orange-400' },
    red: { bg: 'bg-red-500', text: 'text-red-500', hover: 'hover:border-red-400' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', hover: 'hover:border-cyan-400' },
    pink: { bg: 'bg-pink-500', text: 'text-pink-500', hover: 'hover:border-pink-400' },
    teal: { bg: 'bg-teal-500', text: 'text-teal-500', hover: 'hover:border-teal-400' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', hover: 'hover:border-emerald-400' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-500', hover: 'hover:border-violet-400' },
  }

  const renderIcon = (iconName: string, colorClass: string) => {
    const iconColor = colorMap[colorClass]?.text || 'text-blue-500'
    switch (iconName) {
      case 'lightbulb':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      case 'file-text':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      case 'list':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
      case 'pen-tool':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      case 'layout':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
      case 'search':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      case 'refresh-cw':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      case 'shield':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      case 'cpu':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      case 'presentation':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      case 'user-circle':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
      case 'git-compare':
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      default:
        return <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    }
  }

  const handleFeatureClick = (path: string) => {
    navigate(path)
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* 顶部标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              智研笔
            </h1>
          </div>
          <p className="text-xl text-blue-100 mb-2">毕业论文写作平台</p>
          <p className="text-sm text-blue-200 max-w-2xl mx-auto">
            AI 驱动的全流程论文写作助手，从选题到答辩，一站式解决你的毕业论文难题
          </p>
        </div>

        {/* 功能网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => {
            const colors = colorMap[feature.color]
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.path)}
                className={`group bg-white rounded-xl shadow-lg p-5 sm:p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent ${colors.hover}`}
              >
                {/* 图标 */}
                <div className="flex justify-center mb-4">
                  <div className={`w-14 h-14 ${colors.bg} bg-opacity-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {renderIcon(feature.icon, feature.color)}
                  </div>
                </div>

                {/* 名称 */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 text-center">
                  {feature.name}
                </h3>

                {/* 描述 */}
                <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed">
                  {feature.description}
                </p>

                {/* 悬停箭头 */}
                <div className="mt-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm text-blue-100">Powered by DeepSeek AI</span>
          </div>
          <p className="mt-4 text-xs text-blue-200">
            点击任意功能卡片，即可开始使用
          </p>
        </div>
      </div>
    </section>
  )
}

export default HeroSection