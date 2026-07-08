/**
 * Home页面 - 首页组件
 * 整合Header、HeroSection和Footer组件
 */
import Header from '../components/header'
import HeroSection from '../components/herosection'
import Footer from '../components/footer'

/**
 * Home页面主函数组件
 * @returns 完整的首页布局
 */
function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主体内容区域 */}
      <main className="flex-1">
        <HeroSection />
      </main>

      {/* 底部版权信息 */}
      <Footer />
    </div>
  )
}

export default Home
