/**
 * 用户数据生成器
 * 生成100个测试用户数据，包含手机号和邮箱格式
 */

export interface User {
  id: number
  username: string
  password: string
  type: 'phone' | 'email'
}

/**
 * 生成随机手机号
 * 格式：1[3-9]XXXXXXXX（共11位）
 */
function generatePhone(): string {
  const prefixes = ['13', '14', '15', '16', '17', '18', '19']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  // 生成8位随机数字，确保手机号总长度为11位
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  const phone = '1' + prefix + suffix
  return phone
}

/**
 * 生成随机邮箱
 * 格式：xxx@xxx.com/cn/net
 */
function generateEmail(): string {
  const domains = ['gmail.com', 'qq.com', '163.com', '126.com', 'outlook.com', 'sina.com', 'sohu.com', 'foxmail.com']
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let localPart = ''
  const length = Math.floor(Math.random() * 10) + 5
  for (let i = 0; i < length; i++) {
    localPart += chars[Math.floor(Math.random() * chars.length)]
  }
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${localPart}@${domain}`
}

/**
 * 生成符合要求的密码
 * 格式：大写英文字母+小写英文字母+数字+特殊符号，长度8-12位
 */
function generatePassword(): string {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  // 确保每种类型至少有一个字符
  let password = ''
  password += upperChars[Math.floor(Math.random() * upperChars.length)]
  password += lowerChars[Math.floor(Math.random() * lowerChars.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += specialChars[Math.floor(Math.random() * specialChars.length)]

  // 填充剩余长度（8-12位）
  const allChars = upperChars + lowerChars + numbers + specialChars
  const remainingLength = Math.floor(Math.random() * 5) + 4 // 4-8位剩余

  for (let i = 0; i < remainingLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * 生成100个测试用户
 */
export function generateUsers(): User[] {
  const users: User[] = []

  for (let i = 0; i < 100; i++) {
    const isPhone = Math.random() > 0.5
    const username = isPhone ? generatePhone() : generateEmail()

    users.push({
      id: i + 1,
      username,
      password: generatePassword(),
      type: isPhone ? 'phone' : 'email'
    })
  }

  return users
}

/**
 * 验证用户名格式（手机号或邮箱）
 */
export function validateUsername(username: string): { valid: boolean; message: string } {
  // 清理输入中的空白字符（包括空格、制表符、换行符等）
  const cleanedUsername = username.replace(/\s/g, '')

  // 手机号验证：1[3-9]XXXXXXXXX（共11位）
  const phoneRegex = /^1[3-9]\d{9}$/

  // 邮箱验证
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!cleanedUsername) {
    return { valid: false, message: '请输入手机号或邮箱' }
  }

  // 检查是否为手机号格式
  if (/^1\d{10}$/.test(cleanedUsername)) {
    if (phoneRegex.test(cleanedUsername)) {
      return { valid: true, message: '' }
    } else {
      return { valid: false, message: '请输入正确的手机号格式（1[3-9]开头的11位数字）' }
    }
  }

  if (emailRegex.test(cleanedUsername)) {
    return { valid: true, message: '' }
  }

  return { valid: false, message: '请输入正确的手机号（11位）或邮箱格式' }
}

/**
 * 验证密码格式
 * 大写英文字母+小写英文字母+数字+特殊符号，长度8-12位
 */
export function validatePassword(password: string): { valid: boolean; message: string } {
  if (!password) {
    return { valid: false, message: '请输入密码' }
  }

  if (password.length < 8 || password.length > 12) {
    return { valid: false, message: '密码长度应为8-12位' }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)

  if (!hasUpperCase) {
    return { valid: false, message: '密码必须包含大写英文字母' }
  }

  if (!hasLowerCase) {
    return { valid: false, message: '密码必须包含小写英文字母' }
  }

  if (!hasNumber) {
    return { valid: false, message: '密码必须包含数字' }
  }

  if (!hasSpecialChar) {
    return { valid: false, message: '密码必须包含特殊符号(!@#$%^&*等)' }
  }

  return { valid: true, message: '' }
}

/**
 * 生成动态验证码
 * 字母+数字组合，6位
 */
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * 验证码格式验证
 */
export function validateVerificationCode(code: string): { valid: boolean; message: string } {
  if (!code) {
    return { valid: false, message: '请输入验证码' }
  }

  if (code.length !== 6) {
    return { valid: false, message: '验证码应为6位字符' }
  }

  const codeRegex = /^[a-zA-Z0-9]{6}$/
  if (!codeRegex.test(code)) {
    return { valid: false, message: '验证码只能包含字母和数字' }
  }

  return { valid: true, message: '' }
}

// 导出预生成的100个用户数据
export const mockUsers = generateUsers()

// 将 mockUsers 挂载到全局对象，方便在浏览器控制台查看和测试
if (typeof window !== 'undefined') {
  (window as any).mockUsers = mockUsers
}
