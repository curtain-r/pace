import { Router } from 'express'
import { appendFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase.js'

const router = Router()

const PET_PRESETS = {
  cat: {
    defaultName: '小团子',
    personality: '慵懒可爱，喜欢被摸下巴，偶尔会撒娇',
  },
  dog: {
    defaultName: '豆包',
    personality: '活泼热情，喜欢贴贴和陪伴，会摇尾巴表达开心',
  },
  rabbit: {
    defaultName: '糯米',
    personality: '温柔安静，喜欢被轻轻摸头，偶尔会蹦跳撒欢',
  },
}

function log(...args) {
  const line = `[${new Date().toISOString()}] [invite] ${args.join(' ')}\n`
  process.stdout.write(line)
  appendFileSync('/tmp/pace-auth.log', line)
}

/**
 * POST /api/invite/generate
 * 生成邀请码，创建 pending 状态的 couple 记录
 */
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id
    log('generate called, userId:', userId)

    // 检查用户是否已有 active 的情侣关系
    const { data: existing } = await supabase
      .from('couples')
      .select('id')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return res.status(400).json({ error: '你已经有绑定的伴侣了' })
    }

    // 生成 6 位邀请码
    const inviteCode = uuidv4().slice(0, 8).toUpperCase()

    const { data, error } = await supabase
      .from('couples')
      .insert({
        user_a_id: userId,
        invite_code: inviteCode,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    res.json({ inviteCode: data.invite_code, coupleId: data.id })
  } catch (err) {
    log('generate error:', err.message, err.stack)
    res.status(500).json({ error: '生成邀请码失败' })
  }
})

/**
 * POST /api/invite/accept
 * 接受邀请码，绑定情侣关系，创建共养宠物
 */
router.post('/accept', async (req, res) => {
  try {
    const userId = req.user.id
    const { code, species = 'cat', petName } = req.body

    if (!code) {
      return res.status(400).json({ error: '请输入邀请码' })
    }

    const normalizedSpecies = String(species).toLowerCase()
    if (!PET_PRESETS[normalizedSpecies]) {
      return res.status(400).json({ error: '不支持的宠物类型' })
    }

    // 检查用户是否已有 active 的情侣关系
    const { data: existing } = await supabase
      .from('couples')
      .select('id')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return res.status(400).json({ error: '你已经有绑定的伴侣了' })
    }

    // 查找邀请码
    const { data: couple, error: findError } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', code.toUpperCase())
      .eq('status', 'pending')
      .maybeSingle()

    if (findError || !couple) {
      return res.status(404).json({ error: '邀请码无效或已过期' })
    }

    if (couple.user_a_id === userId) {
      return res.status(400).json({ error: '不能接受自己的邀请码' })
    }

    // 创建宠物
    const finalName = String(petName || '').trim().slice(0, 20) || PET_PRESETS[normalizedSpecies].defaultName
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .insert({
        couple_id: couple.id,
        name: finalName,
        species: normalizedSpecies,
        personality: PET_PRESETS[normalizedSpecies].personality,
        hunger: 80,
        mood: 80,
        intimacy: 0,
      })
      .select()
      .single()

    if (petError) throw petError

    // 更新 couple 状态
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('couples')
      .update({
        user_b_id: userId,
        pet_id: pet.id,
        status: 'active',
        bound_at: now,
      })
      .eq('id', couple.id)

    if (updateError) throw updateError

    // 写入双方绑定历史
    await supabase.from('couple_histories').insert([
      {
        user_id: couple.user_a_id,
        couple_id: couple.id,
        role: 'inviter',
        joined_at: now,
      },
      {
        user_id: userId,
        couple_id: couple.id,
        role: 'invitee',
        joined_at: now,
      },
    ])

    res.json({ message: '绑定成功！', pet })
  } catch (err) {
    console.error('接受邀请码失败:', err)
    res.status(500).json({ error: '绑定失败' })
  }
})

export default router
