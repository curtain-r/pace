import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

// 宠物状态衰减计算（惰性计算）
function calculateCurrentStats(pet) {
  const now = Date.now()

  // 饥饿衰减：每小时 -5
  const hoursSinceLastFed = (now - new Date(pet.last_fed_at || pet.created_at).getTime()) / (1000 * 60 * 60)
  const hungerDecay = Math.floor(hoursSinceLastFed * 5)
  const currentHunger = Math.max(0, Math.min(100, pet.hunger - hungerDecay))

  // 心情衰减：每2小时 -3
  const hoursSinceLastPetted = (now - new Date(pet.last_petted_at || pet.created_at).getTime()) / (1000 * 60 * 60)
  const moodDecay = Math.floor(hoursSinceLastPetted * 1.5)
  const currentMood = Math.max(0, Math.min(100, pet.mood - moodDecay))

  return {
    ...pet,
    hunger: currentHunger,
    mood: currentMood,
  }
}

/**
 * GET /api/pet
 * 获取当前情侣的宠物信息
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id

    // 查找用户所在的 active couple
    const { data: couple } = await supabase
      .from('couples')
      .select('*, pets(*)')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'active')
      .maybeSingle()

    if (!couple || !couple.pets) {
      return res.status(404).json({ error: '还没有绑定伴侣或宠物' })
    }

    const pet = calculateCurrentStats(couple.pets)
    res.json({ pet, coupleId: couple.id })
  } catch (err) {
    console.error('获取宠物失败:', err)
    res.status(500).json({ error: '获取宠物信息失败' })
  }
})

/**
 * POST /api/pet/interact
 * 宠物互动：喂食(feed) / 抚摸(pet)
 */
router.post('/interact', async (req, res) => {
  try {
    const userId = req.user.id
    const { type } = req.body

    if (!['feed', 'pet'].includes(type)) {
      return res.status(400).json({ error: '不支持的互动类型' })
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

    const pet = calculateCurrentStats(couple.pets)
    const now = new Date().toISOString()
    let delta = {}
    const updates = {}

    if (type === 'feed') {
      delta = { hunger: 30, intimacy: 2 }
      updates.hunger = Math.min(100, pet.hunger + 30)
      updates.last_fed_at = now
      updates.intimacy = pet.intimacy + 2
    } else if (type === 'pet') {
      delta = { mood: 20, intimacy: 3 }
      updates.mood = Math.min(100, pet.mood + 20)
      updates.last_petted_at = now
      updates.intimacy = pet.intimacy + 3
    }

    // 更新宠物状态
    const { data: updatedPet, error: updateError } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', pet.id)
      .select()
      .single()

    if (updateError) throw updateError

    // 记录互动
    await supabase.from('interactions').insert({
      pet_id: pet.id,
      user_id: userId,
      type,
      delta,
    })

    res.json({ pet: calculateCurrentStats(updatedPet), delta })
  } catch (err) {
    console.error('互动失败:', err)
    res.status(500).json({ error: '互动失败' })
  }
})

export default router
