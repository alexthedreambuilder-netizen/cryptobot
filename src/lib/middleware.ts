import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }
  return { user }
}

export function requireAdmin(req: NextRequest) {
  const result = requireAuth(req)
  if ('error' in result) {
    return result
  }
  if (!result.user.isAdmin) {
    return { error: 'Access denied', status: 403 }
  }
  return result
}
