/**
 * Upload页面 - 上传页面组件
 * 上传功能占位页
 */
import Header from '../components/header'
import Footer from '../components/footer'

/**
 * Upload页面主函数组件
 * @returns 上传页面布局
 */
function Upload() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体内容区域 */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📤</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">上传页面</h1>
          <p className="text-gray-600">文件上传功能开发中...</p>
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer">
              <div className="text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p>点击或拖拽文件到此处上传</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>支持格式：PDF, DOC, DOCX, TXT</p>
            </div>
          </div>
        </div>
      </main>

      {/* 底部版权信息 */}
      <Footer />
    </div>
  )
}

export default Upload
