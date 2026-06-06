import { serializeCookie } from '../_shared/auth.js'

export default function handler(request, response) {
  response.setHeader('Set-Cookie', serializeCookie('localfy_session', '', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
    maxAge: 0,
  }))
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.statusCode = 200
  response.end(JSON.stringify({ success: true }))
}
