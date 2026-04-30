import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { chatWithPet } from '../lib/gemini.js'

const router = Router()

/**
 * POST /api/chat
 * 和宠物对话（代理 Gemini AI 请求）
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: '请输入对话内容' })
    }

    // 查找宠物
    const { data: couple } = await supabase
      .from('couples')
      .select('*, pets(*)')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'active')
      .maybeSingle()

    if (!couple || !couple.pets) {
      return res.status(404).json({ error: '还没有宠物' })
    }

    const pet = couple.pets

    // 调用 Gemini AI
    const reply = await chatWithPet(pet.personality, pet.name, message)

    // 记录对话互动
    await supabase.from('interactions').insert({
      pet_id: pet.id,
      user_id: userId,
      type: 'chat',
      payload: { userMessage: message, petReply: reply },
      delta: { intimacy: 1 },
    })

    // 增加亲密度
    await supabase
      .from('pets')
      .update({ intimacy: pet.intimacy + 1 })
      .eq('id', pet.id)

    res.json({ reply })
  } catch (err) {
    console.error('对话失败:', err)
    res.status(500).json({ error: '对话失败，请稍后再试' })
  }
})

export default router
