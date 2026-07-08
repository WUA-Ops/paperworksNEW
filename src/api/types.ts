export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface TopicInspirationParams {
  major: string
  keywords?: string
  level?: 'undergraduate' | 'master' | 'doctoral'
}

export interface TopicItem {
  id: string
  title: string
  description: string
  major: string
  difficulty: string
  references: string[]
}

export interface ProposalParams {
  topic: string
  major: string
  level?: 'undergraduate' | 'master' | 'doctoral'
  requirements?: string
}

export interface ProposalResult {
  id: string
  topic: string
  background: string
  significance: string
  literatureReview: string
  researchContent: string
  methodology: string
  schedule: ScheduleItem[]
  references: string[]
}

export interface ScheduleItem {
  phase: string
  content: string
  startDate: string
  endDate: string
}

export interface OutlineParams {
  topic: string
  major: string
  level?: 'undergraduate' | 'master' | 'doctoral'
  chapters?: number
}

export interface OutlineResult {
  id: string
  topic: string
  chapters: ChapterItem[]
}

export interface ChapterItem {
  title: string
  sections: SectionItem[]
}

export interface SectionItem {
  title: string
  keyPoints: string[]
}

export interface WritingParams {
  topic: string
  content: string
  type: 'continue' | 'polish' | 'expand' | 'summarize'
  style?: 'academic' | 'casual' | 'formal'
}

export interface WritingResult {
  id: string
  content: string
  wordCount: number
}

export interface PaperCheckParams {
  paperId?: string
  file?: File
  title?: string
  content?: string
}

export interface PaperCheckResult {
  id: string
  totalRate: number
  similarRate: number
  originalRate: number
  details: CheckDetailItem[]
}

export interface CheckDetailItem {
  paragraph: string
  similarRate: number
  sources: SimilarSource[]
}

export interface SimilarSource {
  title: string
  author: string
  url: string
  similarContent: string
  similarRate: number
}

export interface ReductionParams {
  paperId?: string
  content: string
  targetRate: number
  mode?: 'conservative' | 'moderate' | 'aggressive'
}

export interface ReductionResult {
  id: string
  originalContent: string
  reducedContent: string
  originalRate: number
  reducedRate: number
  reductionRate: number
}

export interface AIGCDetectionParams {
  paperId?: string
  file?: File
  title?: string
  content?: string
}

export interface AIGCDetectionResult {
  id: string
  totalRate: number
  aiRate: number
  humanRate: number
  details: AIGCDetailItem[]
}

export interface AIGCDetailItem {
  paragraph: string
  aiRate: number
  aiSegments: string[]
}

export interface AIReductionParams {
  paperId?: string
  content: string
  targetRate: number
  mode?: 'conservative' | 'moderate' | 'aggressive'
}

export interface AIReductionResult {
  id: string
  originalContent: string
  reducedContent: string
  originalAiRate: number
  reducedAiRate: number
}

export interface PPTParams {
  paperId?: string
  file?: File
  title?: string
  content?: string
  templateId: number
  version: 'basic' | 'advanced'
}

export interface PPTResult {
  id: string
  title: string
  templateId: number
  slides: PPTSlide[]
  downloadUrl: string
}

export interface PPTSlide {
  pageNumber: number
  title: string
  content: string
  notes?: string
  layout: string
}

export interface DefenseScriptParams {
  paperId?: string
  title?: string
  content?: string
  duration?: number
  style?: 'formal' | 'casual'
}

export interface DefenseScriptResult {
  id: string
  title: string
  duration: number
  script: string
  keyPoints: string[]
  qaList: QAItem[]
}

export interface QAItem {
  question: string
  answer: string
}

export interface TutorSimulationParams {
  paperId?: string
  title?: string
  content?: string
  question: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface TutorSimulationResult {
  id: string
  question: string
  answer: string
  score: number
  suggestions: string[]
  followUpQuestions: string[]
}

export interface VersionCompareParams {
  paperId: string
  versionA: string
  versionB: string
}

export interface VersionCompareResult {
  id: string
  versionA: VersionInfo
  versionB: VersionInfo
  differences: DifferenceItem[]
  similarity: number
}

export interface VersionInfo {
  version: string
  createdAt: string
  wordCount: number
  content: string
}

export interface DifferenceItem {
  type: 'added' | 'removed' | 'modified'
  position: string
  oldContent?: string
  newContent?: string
}

export interface FormatStandardParams {
  paperId?: string
  file?: File
  content?: string
  format: 'gbt7714' | 'apa' | 'mla' | 'chicago'
}

export interface FormatStandardResult {
  id: string
  originalContent: string
  formattedContent: string
  changes: FormatChange[]
}

export interface FormatChange {
  type: string
  position: string
  before: string
  after: string
}

export interface FileUploadResult {
  id: string
  fileName: string
  fileSize: number
  content: string
  wordCount: number
}

export interface UserInfo {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'student' | 'teacher' | 'admin'
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export interface RegisterParams {
  username: string
  password: string
  email: string
  role?: 'student' | 'teacher'
}
