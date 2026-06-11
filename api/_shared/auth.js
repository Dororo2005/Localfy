import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const AUTH_SECRET = process.env.AUTH_SECRET || 'localfy-vercel-demo-secret'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7
const userStorePath = fileURLToPath(new URL('../../server/data/users.json', import.meta.url))

export const demoUser = {
  id: 'user_1',
  name: 'Local Admin',
  email: 'admin@localfy.app',
  role: 'admin',
  salt: 'c2d2f8a7e3b14d1a',
  passwordHash: 'ce868a9577cf5b707eb83aa7cbca0b161848657d6b7c0af5d1fef2f5c79f13e6',
}

const readJson = async (filePath, fallback) => {
  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export const getUsers = async () => {
  const users = await readJson(userStorePath, [demoUser])
  return Array.isArray(users) && users.length > 0 ? users : [demoUser]
}

const writeUsers = async (users) => {
  await writeFile(userStorePath, `${JSON.stringify(users, null, 2)}\n`, 'utf8')
}

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url')

const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8')

export const serializeCookie = (name, value, options = {}) => {
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
  if (options.secure) {
    pieces.push('Secure')
  }
  return pieces.join('; ')
}

export const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((cookies, part) => {
    const [rawName, ...rawValueParts] = part.trim().split('=')
    if (!rawName) {
      return cookies
    }
    cookies[rawName] = decodeURIComponent(rawValueParts.join('=') ?? '')
    return cookies
  }, {})

export const verifyPassword = (password, user) => {
  const derivedHash = pbkdf2Sync(password, user.salt, 120000, 32, 'sha256').toString('hex')
  const expected = Buffer.from(user.passwordHash, 'hex')
  const actual = Buffer.from(derivedHash, 'hex')
  if (expected.length !== actual.length) {
    return false
  }
  return timingSafeEqual(expected, actual)
}

export const hashPassword = (password) => {
  const salt = randomBytes(8).toString('hex')
  const passwordHash = pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex')
  return { salt, passwordHash }
}

export const findUserByEmail = async (email) => {
  const users = await getUsers()
  return users.find((entry) => entry.email.toLowerCase() === email.toLowerCase()) ?? null
}

export const resetUserPassword = async (email, password) => {
  const users = await getUsers()
  const userIndex = users.findIndex((entry) => entry.email.toLowerCase() === email.toLowerCase())

  if (userIndex === -1) {
    return null
  }

  const nextUsers = [...users]
  nextUsers[userIndex] = {
    ...nextUsers[userIndex],
    ...hashPassword(password),
  }

  await writeUsers(nextUsers)
  return nextUsers[userIndex]
}

export const createSessionToken = (user) => {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  }
  const body = base64UrlEncode(JSON.stringify(payload))
  const signature = createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  return `${body}.${signature}`
}

export const verifySessionToken = (token) => {
  const [body, signature] = token.split('.')
  if (!body || !signature) {
    return null
  }

  const expectedSignature = createHmac('sha256', AUTH_SECRET).update(body).digest('base64url')
  const expectedBuffer = Buffer.from(expectedSignature)
  const actualBuffer = Buffer.from(signature)
  if (expectedBuffer.length !== actualBuffer.length) {
    return null
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body))
    if (!payload || typeof payload !== 'object') {
      return null
    }

    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export const getAuthenticatedUser = async (request) => {
  const cookies = parseCookies(request.headers.cookie)
  const token = cookies.localfy_session
  if (!token) {
    return null
  }

  const payload = verifySessionToken(token)
  if (!payload) {
    return null
  }

  const users = await getUsers()

  return (
    users.find((user) => user.id === payload.sub) ?? {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    }
  )
}
