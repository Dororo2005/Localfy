import { getAuthenticatedUser } from '../_shared/auth.js'

export default async function handler(request, response) {
  const user = await getAuthenticatedUser(request)
  response.setHeader('content-type', 'application/json; charset=utf-8')

  if (!user) {
    response.statusCode = 401
    response.end(JSON.stringify({ message: 'Chua dang nhap.' }))
    return
  }

  response.statusCode = 200
  response.end(JSON.stringify({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }))
}
