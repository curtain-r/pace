import { supabase } from '../lib/supabase.js'

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`
  process.stdout.write(line)
}

/**
 * 验证请求中的 Supabase Auth token
 * 从 Authorization header 中提取 Bearer token，验证用户身份
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log('[auth] 缺少 Authorization header, path:', req.path)
    return res.status(401).json({ error: '未登录' })
  }

  const token = authHeader.split(' ')[1]
  log('[auth] token 前30位:', token.slice(0, 30))

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    log('[auth] 验证失败:', error?.message, '| status:', error?.status, '| code:', error?.code)
    return res.status(401).json({ error: '登录已过期', detail: error?.message })
  }

  log('[auth] 验证成功, userId:', data.user.id)
  req.user = data.user
  next()
}
