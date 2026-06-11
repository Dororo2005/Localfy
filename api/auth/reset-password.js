import { resetUserPassword } from '../_shared/auth.js'

export default async function handler(request, response) {
  response.setHeader('content-type', 'application/json; charset=utf-8')

  if (request.method !== 'POST') {
    response.statusCode = 405
    response.end(JSON.stringify({ message: 'Method not allowed' }))
    return
  }

  try {
    const chunks = []
    for await (const chunk of request) {
      chunks.push(chunk)
    }

    const bodyText = Buffer.concat(chunks).toString('utf8')
    const body = bodyText ? JSON.parse(bodyText) : {}
    const email = String(body.email ?? '').trim().toLowerCase()
    const newPassword = String(body.newPassword ?? '').trim()
    const confirmPassword = String(body.confirmPassword ?? '').trim()

    if (!email || !newPassword || !confirmPassword) {
      response.statusCode = 400
      response.end(JSON.stringify({ message: 'Vui long nhap day du email va mat khau moi.' }))
      return
    }

    if (newPassword.length < 6) {
      response.statusCode = 400
      response.end(JSON.stringify({ message: 'Mat khau moi phai co it nhat 6 ky tu.' }))
      return
    }

    if (newPassword !== confirmPassword) {
      response.statusCode = 400
      response.end(JSON.stringify({ message: 'Xac nhan mat khau moi khong khop.' }))
      return
    }

    const user = await resetUserPassword(email, newPassword)
    if (!user) {
      response.statusCode = 404
      response.end(JSON.stringify({ message: 'Khong tim thay tai khoan voi email nay.' }))
      return
    }

    response.statusCode = 200
    response.end(JSON.stringify({ message: 'Da cap nhat mat khau moi thanh cong.' }))
  } catch {
    response.statusCode = 400
    response.end(JSON.stringify({ message: 'Khong the cap nhat mat khau luc nay.' }))
  }
}
