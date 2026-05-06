import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import inviteRouter from './routes/invite.js'
import petRouter from './routes/pet.js'
import chatRouter from './routes/chat.js'
import { authMiddleware } from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
function normalizeOrigin(urlLike) {
  if (!urlLike) return null
  try {
    return new URL(urlLike).origin
  } catch {
    return urlLike
  }
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  normalizeOrigin(process.env.FRONTEND_URL),
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如 curl、Postman）
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error(`CORS blocked: ${origin}; allowed: ${allowedOrigins.join(', ')}`))
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

// 健康检查（Render 免费层保活用）
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 需要登录的路由
app.use('/api/invite', authMiddleware, inviteRouter)
app.use('/api/pet', authMiddleware, petRouter)
app.use('/api/chat', authMiddleware, chatRouter)

app.listen(PORT, () => {
  console.log(`🐾 Pace API server running on port ${PORT}`)
})
