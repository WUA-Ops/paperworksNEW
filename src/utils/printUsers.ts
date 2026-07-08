import { mockUsers } from './userData'

console.log('=== 毕业论文平台测试用户数据 ===')
console.log(`共生成 ${mockUsers.length} 个测试用户`)
console.log('\n前 10 个测试用户：')
console.log('用户名 | 密码 | 类型')
console.log('---|---|---')

mockUsers.slice(0, 10).forEach((user) => {
  console.log(`${user.username} | ${user.password} | ${user.type === 'phone' ? '手机号' : '邮箱'}`)
})

console.log('\n使用方法：')
console.log('1. 复制上面的用户名和密码')
console.log('2. 在登录表单中输入用户名和密码')
console.log('3. 点击"获取验证码"按钮')
console.log('4. 输入弹出的验证码')
console.log('5. 点击登录按钮')
