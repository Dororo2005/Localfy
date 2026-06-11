import { createSessionToken, findUserByEmail, serializeCookie, verifyPassword } from '../_shared/auth.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('content-type', 'application/json; charset=utf-8')
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
    const password = String(body.password ?? '').trim()

    if (!email || !password) {
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.statusCode = 400
      response.end(JSON.stringify({ message: 'Can nhap email va mat khau.' }))
      return
    }

    const user = await findUserByEmail(email)
    if (!user || !verifyPassword(password, user)) {
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.statusCode = 401
      response.end(JSON.stringify({ message: 'Email hoac mat khau khong dung.' }))
      return
    }

    const token = createSessionToken(user)
    response.setHeader('Set-Cookie', serializeCookie('localfy_session', token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    }))
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.statusCode = 200
    response.end(JSON.stringify({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }))
  } catch {
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.statusCode = 400
    response.end(JSON.stringify({ message: 'Du lieu yeu cau khong hop le.' }))
  }
}
