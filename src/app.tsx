/**
 * App组件 - 应用主组件
 * 配置路由
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import WritingPage from './pages/WritingPage'
import WritingAssistant from './pages/WritingAssistant'
import PaperCheck from './pages/PaperCheck'
import PaperReduction from './pages/PaperReduction'
import SmartAIReduction from './pages/SmartAIReduction'
import AIGCDetectionUpload from './pages/AIGCDetectionUpload'
import AIThesisGenerator from './pages/AIThesisGenerator'
import AIPPTGenerator from './pages/AIPPTGenerator'
import AITutorSimulation from './pages/AITutorSimulation'
import TopicInspiration from './pages/TopicInspiration'
import ProposalReport from './pages/ProposalReport'
import SmartOutline from './pages/SmartOutline'
import FormatStandardization from './pages/FormatStandardization'
import VersionCompare from './pages/VersionCompare'
import WritingTutoring from './pages/WritingTutoring'

/**
 * App主函数组件
 * @returns 配置好路由的应用
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 首页路由 */}
        <Route path="/" element={<Home />} />
        
        {/* 上传页面路由 */}
        <Route path="/upload" element={<Upload />} />
        
        {/* 多版本对比路由 */}
        <Route path="/compare" element={<VersionCompare />} />
        
        {/* 写作辅导页面路由 */}
        <Route path="/writing" element={<WritingPage />} />
        
        {/* 写作辅导系统总览路由 */}
        <Route path="/writing-tutoring" element={<WritingTutoring />} />
        
        {/* 格式规范化路由 */}
        <Route path="/format" element={<FormatStandardization />} />
        
        {/* 开题报告路由 */}
        <Route path="/proposal" element={<ProposalReport />} />
        
        {/* 智能大纲路由 */}
        <Route path="/outline" element={<SmartOutline />} />
        
        {/* 写作辅导助手路由 */}
        <Route path="/assistant" element={<WritingAssistant />} />
        
        {/* 论文查重路由 */}
        <Route path="/check" element={<PaperCheck />} />
        
        {/* 智能降重路由 */}
        <Route path="/reduction" element={<PaperReduction />} />
        
        {/* AIGC检测路由（新版虚线框上传） */}
        <Route path="/aigc" element={<AIGCDetectionUpload />} />
        
        {/* 智能降AI路由 */}
        <Route path="/ai-reduction" element={<SmartAIReduction />} />
        
        {/* AI生成答辩文稿路由 */}
        <Route path="/answer" element={<AIThesisGenerator />} />
        
        {/* AI生成答辩PPT路由 */}
        <Route path="/ppt" element={<AIPPTGenerator />} />
        
        {/* AI模拟导师答辩路由 */}
        <Route path="/tutor" element={<AITutorSimulation />} />
        
        {/* 选题灵感路由 */}
        <Route path="/topic" element={<TopicInspiration />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
