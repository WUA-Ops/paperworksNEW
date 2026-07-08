/**
 * 论文写作平台 - 功能接口封装
 *
 * 所有功能均调用 DeepSeek API，通过不同的 systemPrompt 实现不同角色和能力。
 * 核心功能（写作、查重、降重、AIGC检测）使用高质量提示词，确保输出结构化 JSON。
 * 普通功能（选题、大纲、开题报告等）使用专业提示词，输出格式化文本。
 */

import { callDeepSeek, streamDeepSeek } from './ai'

// ==================== 核心功能 ====================

/**
 * AI 辅助写作
 * 根据主题、类型、字数和风格生成或续写论文内容
 */
export async function assistWriting(params: {
  topic: string
  type: 'continue' | 'expand' | 'polish' | 'summarize' | 'rewrite'
  wordCount?: number
  style?: 'academic' | 'formal' | 'casual'
  content?: string
}) {
  const { topic, type, wordCount = 500, style = 'academic', content = '' } = params

  const typeMap: Record<string, string> = {
    continue: '续写以下内容',
    expand: '扩写以下内容，增加更多细节和论据',
    polish: '润色以下内容，提升学术表达水平',
    summarize: '总结以下内容的要点',
    rewrite: '重写以下内容，保持原意但换一种表达方式',
  }

  const systemPrompt = `你是一位资深的学术论文写作专家，拥有丰富的中文学术写作经验。
你的任务是根据用户的需求，帮助完成论文写作相关的工作。

写作要求：
1. 语言风格：${style === 'academic' ? '严谨的学术风格，使用规范的学术用语' : style === 'formal' ? '正式的书面风格，表达清晰准确' : '通俗易懂的风格，便于理解'}
2. 字数要求：约${wordCount}字
3. 内容要求：逻辑清晰、论据充分、引用规范
4. 格式要求：段落分明，层次清晰
5. 避免空洞表述，确保每段都有实质性内容
6. 注意学术诚信，不编造不存在的参考文献`

  const userPrompt = content
    ? `${typeMap[type]}：\n\n${content}\n\n主题：${topic}\n要求：${typeMap[type]}，约${wordCount}字，${style}风格`
    : `请围绕主题"${topic}"撰写内容，约${wordCount}字，${style}风格`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * 论文查重
 * 分析文本的重复率，返回结构化 JSON 结果
 */
export async function checkPlagiarism(params: { content: string }) {
  const { content } = params

  const systemPrompt = `你是一位专业的论文查重分析专家，精通学术不端检测领域。
你的任务是分析用户提交的论文内容，评估其原创性和可能的重复情况。

请严格按照以下 JSON 格式返回分析结果，不要输出任何其他内容：
{
  "rate": 数字(0-100，表示预估重复率百分比),
  "level": "低/中/高"(重复风险等级),
  "repeated": [
    {
      "text": "可能重复的文本片段",
      "reason": "重复原因分析",
      "suggestion": "修改建议"
    }
  ],
  "suggestions": [
    "整体降重建议1",
    "整体降重建议2"
  ]
}

分析要点：
1. 识别常见的套话、模板化表述
2. 检测可能的引用未标注情况
3. 评估段落结构的原创性
4. 注意学科领域的常用表述与真正重复的区别
5. 给出具体可操作的修改建议`

  const userPrompt = `请分析以下论文内容的查重情况：\n\n${content}`

  const raw = await callDeepSeek(systemPrompt, userPrompt)

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(raw)
  } catch {
    return {
      rate: 0,
      level: '未知',
      repeated: [],
      suggestions: ['解析结果失败，请重试'],
    }
  }
}

/**
 * 智能降重
 * 对论文内容进行改写以降低重复率，同时保持原意不变
 */
export async function reducePlagiarism(params: {
  content: string
  targetRate: number
}) {
  const { content, targetRate } = params

  const systemPrompt = `你是一位专业的论文降重专家，擅长在不改变原意的前提下改写论文内容。

降重要求：
1. 保持原文的核心观点和逻辑结构不变
2. 使用同义替换、句式变换、语序调整等技巧
3. 学术用语要准确，不能为了降重而使用不专业的表述
4. 保持论文的学术性和严谨性
5. 目标重复率：降至${targetRate}%以下
6. 改写后的内容要自然流畅，不能有明显的改写痕迹

降重技巧：
- 同义词替换：将常见词替换为学术同义词
- 句式变换：主动变被动、长句拆短句、短句合长句
- 语序调整：调整分句顺序，改变表达逻辑
- 概括转述：将具体描述转为概括性表述，或反之
- 增删修饰：适当增加或减少修饰成分`

  const userPrompt = `请对以下论文内容进行降重改写，目标重复率降至${targetRate}%以下：\n\n${content}`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * AIGC 检测
 * 分析文本是否由 AI 生成，返回结构化 JSON 结果
 */
export async function detectAIGC(params: { content: string }) {
  const { content } = params

  const systemPrompt = `你是一位专业的 AIGC（AI生成内容）检测分析专家，精通自然语言处理和文本溯源领域。
你的任务是分析用户提交的文本，判断其是否由 AI 生成。

请严格按照以下 JSON 格式返回分析结果，不要输出任何其他内容：
{
  "probability": 数字(0-100，AI生成的概率百分比),
  "level": "低/中/高"(AI生成可能性等级),
  "indicators": [
    {
      "type": "指标类型（如：语言流畅度、逻辑一致性、词汇多样性、句式复杂度等）",
      "description": "该指标的分析说明",
      "score": 数字(0-100，该指标指向AI生成的倾向分数)
    }
  ],
  "aiSegments": [
    "高度疑似AI生成的文本片段1",
    "高度疑似AI生成的文本片段2"
  ],
  "suggestions": [
    "降低AI痕迹的修改建议1",
    "降低AI痕迹的修改建议2"
  ]
}

分析要点：
1. 语言流畅度：AI文本通常过于流畅，缺乏人类写作的自然停顿和语气变化
2. 逻辑一致性：AI文本逻辑过于完美，缺乏人类思维的跳跃性
3. 词汇多样性：AI文本词汇使用均匀，人类写作则有明显偏好
4. 句式复杂度：AI文本句式结构相似度高，人类写作更富变化
5. 情感表达：AI文本情感表达较为模板化
6. 细节描述：AI文本的细节描述往往笼统，缺乏个人经验色彩`

  const userPrompt = `请分析以下文本是否由 AI 生成：\n\n${content}`

  const raw = await callDeepSeek(systemPrompt, userPrompt)

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return JSON.parse(raw)
  } catch {
    return {
      probability: 0,
      level: '未知',
      indicators: [],
      aiSegments: [],
      suggestions: ['解析结果失败，请重试'],
    }
  }
}

// ==================== 普通功能 ====================

/**
 * 选题灵感
 * 根据学科和方向生成论文选题建议
 */
export async function getTopicInspiration(params: {
  subject: string
  count?: number
  direction?: string
}) {
  const { subject, count = 5, direction = '' } = params

  const systemPrompt = `你是一位资深的学术选题顾问，熟悉各学科的研究前沿和热点方向。
你的任务是根据学生的专业和兴趣方向，推荐具有研究价值和创新性的毕业论文选题。

选题要求：
1. 选题要有明确的研究问题和创新点
2. 难度适中，适合本科/硕士毕业论文的深度
3. 具有现实意义或理论价值
4. 研究方法可行，数据或案例可获取
5. 避免过于宽泛或过于狭窄的选题

请按以下格式输出每个选题：
【选题X】标题
- 研究背景：简述选题背景
- 研究问题：明确要解决的核心问题
- 创新点：该选题的创新之处
- 可行性：研究方法和数据来源
- 难度评估：⭐⭐⭐（1-5星）`

  const userPrompt = direction
    ? `我是${subject}专业的学生，对"${direction}"方向感兴趣，请推荐${count}个毕业论文选题。`
    : `我是${subject}专业的学生，请推荐${count}个毕业论文选题。`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * 选题灵感（流式）
 * 逐字返回选题建议内容
 */
export async function* streamTopicInspiration(params: {
  subject: string
  count?: number
  direction?: string
}) {
  const { subject, count = 5, direction = '' } = params

  const systemPrompt = `你是一位资深的学术选题顾问，熟悉各学科的研究前沿和热点方向。
你的任务是根据学生的专业和兴趣方向，推荐具有研究价值和创新性的毕业论文选题。

选题要求：
1. 选题要有明确的研究问题和创新点
2. 难度适中，适合本科/硕士毕业论文的深度
3. 具有现实意义或理论价值
4. 研究方法可行，数据或案例可获取
5. 避免过于宽泛或过于狭窄的选题

请按以下格式输出每个选题：
【选题X】标题
- 研究背景：简述选题背景
- 研究问题：明确要解决的核心问题
- 创新点：该选题的创新之处
- 可行性：研究方法和数据来源
- 难度评估：⭐⭐⭐（1-5星）

请确保每个选题都完整、详细，总共推荐${count}个选题。`

  const userPrompt = direction
    ? `我是${subject}专业的学生，对"${direction}"方向感兴趣，请推荐${count}个毕业论文选题。`
    : `我是${subject}专业的学生，请推荐${count}个毕业论文选题。`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}

/**
 * 智能大纲
 * 根据论文主题和类型生成结构化大纲
 */
export async function generateOutline(params: {
  topic: string
  type?: 'undergraduate' | 'master' | 'doctoral'
  chapters?: number
}) {
  const { topic, type = 'undergraduate', chapters = 5 } = params

  const levelMap: Record<string, string> = {
    undergraduate: '本科',
    master: '硕士',
    doctoral: '博士',
  }

  const systemPrompt = `你是一位经验丰富的论文大纲设计专家，擅长构建逻辑严密、层次清晰的论文框架。
你的任务是根据论文主题，设计一个完整的论文大纲。

大纲设计要求：
1. 层级：${levelMap[type]}论文标准
2. 章节数：${chapters}章左右
3. 逻辑：从提出问题到分析问题再到解决问题
4. 每章要有2-4个小节
5. 每个小节列出关键要点（2-3个）

大纲结构参考：
- 第一章：绪论（研究背景、研究意义、研究方法、论文结构）
- 第二章：文献综述与理论基础
- 中间章节：核心研究内容
- 倒数第二章：研究结果与讨论
- 最后一章：结论与展望

请使用清晰的层级编号（一、（一）、1.）输出大纲。`

  const userPrompt = `请为以下${levelMap[type]}论文主题生成大纲：\n\n主题：${topic}\n\n要求：${chapters}章左右，结构完整，逻辑清晰`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * 智能大纲（流式）
 * 逐字返回大纲内容
 */
export async function* streamGenerateOutline(params: {
  topic: string
  type?: 'undergraduate' | 'master' | 'doctoral'
  chapters?: number
}) {
  const { topic, type = 'undergraduate', chapters = 5 } = params

  const levelMap: Record<string, string> = {
    undergraduate: '本科',
    master: '硕士',
    doctoral: '博士',
  }

  const systemPrompt = `你是一位经验丰富的论文大纲设计专家，擅长构建逻辑严密、层次清晰的论文框架。
你的任务是根据论文主题，设计一个完整的论文大纲。

大纲设计要求：
1. 层级：${levelMap[type]}论文标准
2. 章节数：${chapters}章左右
3. 逻辑：从提出问题到分析问题再到解决问题
4. 每章要有2-4个小节
5. 每个小节列出关键要点（2-3个）

大纲结构参考：
- 第一章：绪论（研究背景、研究意义、研究方法、论文结构）
- 第二章：文献综述与理论基础
- 中间章节：核心研究内容
- 倒数第二章：研究结果与讨论
- 最后一章：结论与展望

请使用清晰的层级编号（一、（一）、1.）输出大纲。`

  const userPrompt = `请为以下${levelMap[type]}论文主题生成大纲：\n\n主题：${topic}\n\n要求：${chapters}章左右，结构完整，逻辑清晰`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}

/**
 * 开题报告
 * 根据论文主题和背景生成开题报告
 */
export async function generateProposal(params: {
  topic: string
  background?: string
  type?: 'undergraduate' | 'master' | 'doctoral'
}) {
  const { topic, background = '', type = 'undergraduate' } = params

  const levelMap: Record<string, string> = {
    undergraduate: '本科',
    master: '硕士',
    doctoral: '博士',
  }

  const systemPrompt = `你是一位资深的开题报告撰写专家，熟悉各类学术开题报告的规范和要求。
你的任务是根据论文主题和背景信息，撰写一份完整的开题报告。

开题报告结构：
1. 选题背景与意义
   - 选题背景
   - 理论意义
   - 实践意义
2. 文献综述
   - 国外研究现状
   - 国内研究现状
   - 研究述评
3. 研究内容与方案
   - 研究目标
   - 研究内容
   - 研究方法
   - 技术路线
4. 研究计划与进度安排
   - 各阶段时间安排
   - 各阶段主要任务
5. 参考文献
   - 列出10-15篇相关参考文献（GB/T 7714格式）

撰写要求：
1. 语言规范，符合${levelMap[type]}开题报告标准
2. 内容充实，避免空话套话
3. 逻辑严密，各部分衔接自然
4. 研究方法具体可行
5. 进度安排合理`

  const userPrompt = background
    ? `请为以下${levelMap[type]}论文撰写开题报告：\n\n主题：${topic}\n\n背景信息：${background}`
    : `请为以下${levelMap[type]}论文撰写开题报告：\n\n主题：${topic}`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * 答辩PPT
 * 根据论文标题和内容生成答辩PPT大纲
 */
export async function generatePPT(params: {
  title: string
  content: string
  slidesCount?: number
}) {
  const { title, content, slidesCount = 15 } = params

  const systemPrompt = `你是一位专业的学术答辩PPT设计顾问，擅长将论文内容转化为清晰、有逻辑的答辩演示文稿。
你的任务是根据论文内容，设计一份答辩PPT的详细大纲。

PPT设计原则：
1. 每页内容精炼，避免大段文字
2. 重点突出，逻辑清晰
3. 图文结合，适当使用图表
4. 风格统一，专业规范

PPT结构参考：
- 第1页：封面（标题、姓名、导师、日期）
- 第2页：目录
- 第3-4页：研究背景与意义
- 第5-6页：文献综述
- 第7-9页：研究方法与过程
- 第10-12页：研究结果与分析
- 第13页：结论与展望
- 第14页：致谢
- 第15页：Q&A

请按以下格式输出每一页：
【第X页】标题
- 要点1
- 要点2
- 要点3
- 配图建议：xxx`

  const userPrompt = `请为以下论文设计答辩PPT大纲（约${slidesCount}页）：\n\n标题：${title}\n\n内容摘要：${content}`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * 答辩PPT（流式）
 * 根据论文标题和内容流式生成答辩PPT大纲
 */
export async function* streamGeneratePPT(params: {
  title: string
  content: string
  slidesCount?: number
  template?: string
  version?: 'basic' | 'advanced'
}) {
  const { title, content, slidesCount = 15, template = '学术简约', version = 'basic' } = params

  const versionDesc = version === 'advanced'
    ? '进阶版：每页PPT需要包含详细的备注说明（演讲者备注），帮助答辩人准备口头陈述'
    : '基础版：仅生成PPT大纲内容，无需备注'

  const systemPrompt = `你是一位专业的学术答辩PPT设计顾问，擅长将论文内容转化为清晰、有逻辑的答辩演示文稿。
你的任务是根据论文内容，设计一份答辩PPT的详细大纲。

PPT设计原则：
1. 每页内容精炼，避免大段文字
2. 重点突出，逻辑清晰
3. 图文结合，适当使用图表
4. 风格统一，专业规范
5. 使用的模板风格为：${template}

PPT结构参考：
- 第1页：封面（标题、姓名、导师、日期）
- 第2页：目录
- 第3-4页：研究背景与意义
- 第5-6页：文献综述
- 第7-9页：研究方法与过程
- 第10-12页：研究结果与分析
- 第13页：结论与展望
- 第14页：致谢
- 第15页：Q&A

请按以下格式输出每一页：
【第X页】标题
- 要点1
- 要点2
- 要点3
- 配图建议：xxx
${version === 'advanced' ? '- 备注：xxx（演讲者口头陈述要点）' : ''}

${versionDesc}`

  const userPrompt = `请为以下论文设计答辩PPT大纲（约${slidesCount}页）：\n\n标题：${title}\n\n内容摘要：${content}`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}

/**
 * AI 答辩导师
 * 模拟答辩委员会成员，对论文进行提问和点评
 */
export async function defenseTutor(params: {
  question: string
  paperTitle: string
  paperContent?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}) {
  const { question, paperTitle, paperContent = '', difficulty = 'medium' } = params

  const difficultyMap: Record<string, string> = {
    easy: '基础性问题，考察对论文基本内容的理解',
    medium: '中等问题，考察对研究方法和结果的深入理解',
    hard: '深度问题，考察对研究局限性和拓展方向的思考',
  }

  const systemPrompt = `你是一位经验丰富的论文答辩委员会成员，同时也是一位耐心的学术导师。
你的任务是针对学生的论文和问题，给出专业的回答和指导。

角色设定：
- 你是答辩委员会的资深教授，学术水平高
- 同时你也是学生的导师，态度友好但要求严格
- 回答要有学术深度，同时通俗易懂
- 适当追问，引导学生深入思考

回答要求：
1. 先直接回答问题
2. 再从答辩委员的角度分析这个问题的考点
3. 给出回答建议和注意事项
4. 难度级别：${difficultyMap[difficulty]}
5. 如果学生回答不够好，给出改进建议`

  const userPrompt = paperContent
    ? `我的论文题目是"${paperTitle}"，${paperContent ? `论文内容概要：${paperContent}。` : ''}\n\n我的问题是：${question}\n\n请以答辩导师的身份给我指导。`
    : `我的论文题目是"${paperTitle}"。\n\n我的问题是：${question}\n\n请以答辩导师的身份给我指导。`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * 格式规范化
 * 按照指定格式标准对论文内容进行格式调整
 */
export async function formatPaper(params: {
  content: string
  format?: 'gbt7714' | 'apa' | 'mla' | 'chicago'
  type?: 'reference' | 'full' | 'citation'
}) {
  const { content, format = 'gbt7714', type = 'reference' } = params

  const formatMap: Record<string, string> = {
    gbt7714: 'GB/T 7714（中国国家标准）',
    apa: 'APA（美国心理学会）',
    mla: 'MLA（现代语言协会）',
    chicago: 'Chicago（芝加哥）',
  }

  const typeMap: Record<string, string> = {
    reference: '参考文献列表',
    full: '全文格式（包括标题、摘要、正文、参考文献）',
    citation: '正文引用格式',
  }

  const systemPrompt = `你是一位专业的学术论文格式规范专家，精通各种学术引用格式和论文排版规范。
你的任务是将用户提交的内容按照指定的格式标准进行规范化处理。

当前格式标准：${formatMap[format]}
处理类型：${typeMap[type]}

格式要求：
1. 严格按照${formatMap[format]}标准执行
2. 作者姓名、出版年份、标题、期刊名、卷期号、页码等要素齐全
3. 标点符号使用正确（中英文标点区分）
4. 排版格式统一规范
5. 如有无法确定的要素，用[待补充]标注

${format === 'gbt7714' ? `GB/T 7714 参考文献格式示例：
- 期刊：[1] 作者.题名[J].刊名,年,卷(期):起止页码.
- 专著：[2] 作者.书名[M].出版地:出版社,年.
- 学位论文：[3] 作者.题名[D].城市:学校,年.
- 电子文献：[4] 作者.题名[EB/OL].(更新日期)[引用日期].网址.` : ''}`

  const userPrompt = `请将以下内容按照${formatMap[format]}标准进行${typeMap[type]}规范化处理：\n\n${content}`

  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * 多版本对比
 * 对比两个版本的论文内容，分析差异
 */
export async function compareVersions(params: {
  version1: string
  version2: string
  focus?: 'all' | 'content' | 'structure' | 'wording'
}) {
  const { version1, version2, focus = 'all' } = params

  const focusMap: Record<string, string> = {
    all: '全面对比（内容、结构、措辞）',
    content: '内容变化（观点、论据、数据）',
    structure: '结构调整（章节、段落、逻辑）',
    wording: '措辞修改（用词、句式、表达）',
  }

  const systemPrompt = `你是一位严谨的论文版本对比分析专家，擅长发现文本之间的细微差异。
你的任务是对比两个版本的论文内容，详细分析它们之间的差异。

对比维度：
1. 内容变化：新增、删除、修改的观点和论据
2. 结构调整：章节顺序、段落增删、逻辑调整
3. 措辞修改：用词变化、句式调整、表达优化
4. 质量评估：改动的合理性和改进程度

当前对比重点：${focusMap[focus]}

请按以下格式输出对比结果：
一、整体概述
- 版本差异程度：大/中/小
- 主要变化方向：xxx

二、详细差异
【差异1】类型：新增/删除/修改
- 位置：xxx
- 版本1：xxx
- 版本2：xxx
- 分析：xxx

三、改进建议
- xxx`

  const userPrompt = `请对比以下两个版本的论文内容：\n\n【版本1】\n${version1}\n\n【版本2】\n${version2}\n\n对比重点：${focusMap[focus]}`

  return callDeepSeek(systemPrompt, userPrompt)
}

// ==================== 流式版本 ====================

/**
 * AI 辅助写作（流式）
 * 逐字返回写作内容，适合实时展示打字效果
 */
export async function* streamAssistWriting(params: {
  topic: string
  type: 'continue' | 'expand' | 'polish' | 'summarize' | 'rewrite'
  wordCount?: number
  style?: 'academic' | 'formal' | 'casual'
  content?: string
}) {
  const { topic, type, wordCount = 500, style = 'academic', content = '' } = params

  const typeMap: Record<string, string> = {
    continue: '续写以下内容',
    expand: '扩写以下内容',
    polish: '润色以下内容',
    summarize: '总结以下内容',
    rewrite: '重写以下内容',
  }

  const systemPrompt = `你是一位资深的学术论文写作专家。请根据用户需求帮助完成论文写作。
语言风格：${style === 'academic' ? '学术风格' : style === 'formal' ? '正式风格' : '通俗风格'}。
字数约${wordCount}字。逻辑清晰、论据充分、避免空洞表述。`

  const userPrompt = content
    ? `${typeMap[type]}：\n\n${content}\n\n主题：${topic}`
    : `请围绕主题"${topic}"撰写内容，约${wordCount}字`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}

/**
 * 智能降重（流式）
 * 逐字返回降重后的内容
 */
export async function* streamReducePlagiarism(params: {
  content: string
  targetRate: number
}) {
  const { content, targetRate } = params

  const systemPrompt = `你是一位专业的论文降重专家。请对用户提交的内容进行降重改写。
要求：保持原意不变，使用同义替换、句式变换等技巧，目标重复率降至${targetRate}%以下。
改写后内容要自然流畅，不能有明显的改写痕迹。`

  const userPrompt = `请降重以下内容：\n\n${content}`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}

/**
 * 智能降AI（流式）
 * 逐字返回降AI后的内容，降低AI检测率
 */
export async function* streamReduceAI(params: {
  content: string
}) {
  const { content } = params

  const systemPrompt = `你是一位专业的论文降AI专家，擅长将AI生成的内容改写为更具人类撰写风格的表达。
降AI要求：
1. 保持原文的核心观点和逻辑结构不变
2. 增加个人化表达和情感色彩
3. 使用更自然的句式变化和语气转换
4. 添加一些口语化或个性化的表述
5. 避免过于流畅和完美的表达，增加一些自然的停顿和转折
6. 适当增加一些不确定性表述（如"可能"、"或许"等）
7. 使用更多样化的词汇，避免AI常见的均匀分布特征

改写后的内容要：
- 更具个人特色和主观性
- 句式长短不一，节奏自然
- 有适当的语气变化和情感表达
- 保持学术性但增加人性化`

  const userPrompt = `请对以下内容进行降AI处理，使其更具人类撰写风格：\n\n${content}`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}

/**
 * AI 答辩导师（流式）
 * 逐字返回导师回答
 */
export async function* streamDefenseTutor(params: {
  question: string
  paperTitle: string
}) {
  const { question, paperTitle } = params

  const systemPrompt = `你是一位经验丰富的论文答辩委员会成员和学术导师。
针对学生的论文和问题，给出专业、友好的回答和指导。
先直接回答问题，再从答辩委员角度分析考点，最后给出回答建议。`

  const userPrompt = `我的论文题目是"${paperTitle}"，我的问题是：${question}`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}

/**
 * AI生成答辩文稿（流式）
 * 根据论文标题和学历生成答辩文稿
 */
export async function* streamGenerateDefenseScript(params: {
  title: string
  education: 'specialty' | 'undergraduate' | 'master'
  wordCount: number
}) {
  const { title, education, wordCount } = params

  const educationMap: Record<string, string> = {
    specialty: '专科',
    undergraduate: '本科',
    master: '硕士'
  }

  const systemPrompt = `你是一位专业的答辩文稿撰写专家，擅长撰写清晰、流畅、有逻辑的答辩文稿。

答辩文稿要求：
1. 开场白：简要介绍自己和论文题目
2. 研究背景：阐述选题背景和研究意义
3. 研究内容：详细介绍研究的主要内容和方法
4. 研究成果：展示研究的主要成果和创新点
5. 结论展望：总结研究结论并展望未来工作
6. 结束语：感谢导师和评委

文稿特点：
- 口语化表达，适合现场口述
- 逻辑清晰，层次分明
- 突出重点，控制时间
- ${educationMap[education]}答辩标准
- 字数约${wordCount}字`

  const userPrompt = `请为以下${educationMap[education]}论文生成答辩文稿：\n\n论文题目：${title}\n\n字数要求：约${wordCount}字`

  yield* streamDeepSeek(systemPrompt, userPrompt)
}
