/**
 * 用户数据存储模块
 * 使用 localStorage 模拟数据库存储用户信息
 */

export interface User {
  id: string
  username: string
  email: string
  password: string
  avatar?: string
  createdAt: string
}

const USERS_KEY = 'zhiyanbi_users'
const CURRENT_USER_KEY = 'zhiyanbi_current_user'

// 获取所有用户
function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY)
  return data ? JSON.parse(data) : []
}

// 保存所有用户
function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// 生成用户ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 注册
export function register(username: string, email: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getUsers()

  // 检查用户名是否已存在
  if (users.some(u => u.username === username)) {
    return { success: false, message: '用户名已存在' }
  }

  // 检查邮箱是否已存在
  if (users.some(u => u.email === email)) {
    return { success: false, message: '邮箱已被注册' }
  }

  const newUser: User = {
    id: generateId(),
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  return { success: true, message: '注册成功', user: newUser }
}

// 登录
export function login(username: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getUsers()

  const user = users.find(u => u.username === username)
  if (!user) {
    return { success: false, message: '用户名不存在' }
  }

  if (user.password !== password) {
    return { success: false, message: '密码错误' }
  }

  // 保存当前登录用户（不保存密码）
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  }))

  return { success: true, message: '登录成功', user }
}

// 登出
export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// 获取当前登录用户
export function getCurrentUser(): { id: string; username: string; email: string; createdAt: string } | null {
  const data = localStorage.getItem(CURRENT_USER_KEY)
  return data ? JSON.parse(data) : null
}
