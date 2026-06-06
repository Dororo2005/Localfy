import http from 'node:http'
import path from 'node:path'
import { randomBytes, randomUUID, pbkdf2Sync, timingSafeEqual } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const clientDistDir = path.join(rootDir, 'dist')
const userStorePath = path.join(__dirname, 'data', 'users.json')
const sessionCookieName = 'localfy_session'
const sessionTtlMs = 1000 * 60 * 60 * 24 * 7

const sessions = new Map()

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
])

const demoSalt = 'c2d2f8a7e3b14d1a'
const demoPasswordHash = 'ce868a9577cf5b707eb83aa7cbca0b161848657d6b7c0af5d1fef2f5c79f13e6'

const readJson = async (filePath, fallback) => {
  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const users = await readJson(userStorePath, [
  {
    id: 'user_1',
    name: 'Local Admin',
    email: 'admin@localfy.app',
    role: 'admin',
    salt: demoSalt,
    passwordHash: demoPasswordHash,
  },
])

const serializeCookie = (name, value, options = {}) => {
  const pieces = [`${name}=${encodeURIComponent(value)}`]
  pieces.push(`Path=${options.path ?? '/'}`)
  if (options.maxAge !== undefined) {
    pieces.push(`Max-Age=${Math.floor(options.maxAge)}`)
  }
  if (options.httpOnly) {
    pieces.push('HttpOnly')
  }
  if (options.sameSite) {
    pieces.push(`SameSite=${options.sameSite}`)
  }
  return pieces.join('; ')
}

const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((cookies, part) => {
    const [rawName, ...rawValueParts] = part.trim().split('=')
    if (!rawName) {
      return cookies
    }
    cookies[rawName] = decodeURIComponent(rawValueParts.join('=') ?? '')
    return cookies
  }, {})

const readBody = async (request) => {
  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (!chunks.length) {
    return {}
  }

  const rawBody = Buffer.concat(chunks).toString('utf8')
  if (!rawBody.trim()) {
    return {}
  }

  return JSON.parse(rawBody)
}

const sendJson = (response, statusCode, payload, extraHeaders = {}) => {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    ...extraHeaders,
  })
  response.end(JSON.stringify(payload))
}

const buildCorsHeaders = (origin) => {
  if (!origin) {
    return {}
  }

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    vary: 'origin',
  }
}

const sendNotFound = (response) => {
  sendJson(response, 404, { message: 'Not found' })
}

const authenticate = (request) => {
  const cookies = parseCookies(request.headers.cookie)
  const sessionId = cookies[sessionCookieName]
  if (!sessionId) {
    return null
  }

  const session = sessions.get(sessionId)
  if (!session) {
    return null
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId)
    return null
  }

  return users.find((user) => user.id === session.userId) ?? null
}

const verifyPassword = (password, user) => {
  const derivedHash = pbkdf2Sync(password, user.salt, 120000, 32, 'sha256').toString('hex')
  const expected = Buffer.from(user.passwordHash, 'hex')
  const actual = Buffer.from(derivedHash, 'hex')
  if (expected.length !== actual.length) {
    return false
  }
  return timingSafeEqual(expected, actual)
}

const tryServeStatic = async (requestPath, response) => {
  const assetPath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\//, '')
  const resolvedPath = path.join(clientDistDir, assetPath)

  if (!resolvedPath.startsWith(clientDistDir)) {
    return false
  }

  try {
    const fileStat = await stat(resolvedPath)
    if (!fileStat.isFile()) {
      return false
    }
  } catch {
    if (requestPath === '/') {
      return false
    }

    const fallbackPath = path.join(clientDistDir, 'index.html')
    try {
      const fallbackStat = await stat(fallbackPath)
      if (!fallbackStat.isFile()) {
        return false
      }
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      createReadStream(fallbackPath).pipe(response)
      return true
    } catch {
      return false
    }
  }

  const contentType = mimeTypes.get(path.extname(resolvedPath)) ?? 'application/octet-stream'
  response.writeHead(200, { 'content-type': contentType })
  createReadStream(resolvedPath).pipe(response)
  return true
}

const server = http.createServer(async (request, response) => {
  const corsHeaders = buildCorsHeaders(request.headers.origin)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders)
    response.end()
    return
  }

  const url = new URL(request.url ?? '/', 'http://127.0.0.1')

  if (url.pathname === '/api/health') {
    sendJson(response, 200, { ok: true }, corsHeaders)
    return
  }

  if (url.pathname === '/api/auth/me' && request.method === 'GET') {
    const user = authenticate(request)
    if (!user) {
      sendJson(response, 401, { message: 'Chua dang nhap.' }, corsHeaders)
      return
    }

    sendJson(
      response,
      200,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      corsHeaders,
    )
    return
  }

  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    try {
      const body = await readBody(request)
      const email = String(body.email ?? '').trim().toLowerCase()
      const password = String(body.password ?? '').trim()

      if (!email || !password) {
        sendJson(response, 400, { message: 'Can nhap email va mat khau.' }, corsHeaders)
        return
      }

      const user = users.find((entry) => entry.email.toLowerCase() === email)
      if (!user || !verifyPassword(password, user)) {
        sendJson(response, 401, { message: 'Email hoac mat khau khong dung.' }, corsHeaders)
        return
      }

      const sessionId = randomUUID()
      sessions.set(sessionId, {
        userId: user.id,
        expiresAt: Date.now() + sessionTtlMs,
      })

      sendJson(
        response,
        200,
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        {
          ...corsHeaders,
          'set-cookie': serializeCookie(sessionCookieName, sessionId, {
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: sessionTtlMs / 1000,
          }),
        },
      )
    } catch {
      sendJson(response, 400, { message: 'Du lieu yeu cau khong hop le.' }, corsHeaders)
    }
    return
  }

  if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
    const cookies = parseCookies(request.headers.cookie)
    const sessionId = cookies[sessionCookieName]
    if (sessionId) {
      sessions.delete(sessionId)
    }

    sendJson(
      response,
      200,
      { success: true },
      {
        ...corsHeaders,
        'set-cookie': serializeCookie(sessionCookieName, '', {
          httpOnly: true,
          sameSite: 'Lax',
          maxAge: 0,
        }),
      },
    )
    return
  }

  if (request.method === 'GET' && !url.pathname.startsWith('/api/')) {
    const served = await tryServeStatic(url.pathname, response)
    if (served) {
      return
    }
  }

  sendNotFound(response)
})

const port = Number.parseInt(process.env.PORT ?? '8787', 10)

server.listen(port, '127.0.0.1', () => {
  console.log(`Localfy auth server running at http://127.0.0.1:${port}`)
})
