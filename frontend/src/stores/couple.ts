import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { usePetStore } from './pet'

export interface Couple {
  id: string
  user_a_id: string
  user_b_id: string
  pet_id: string
  status: 'pending' | 'active' | 'dissolved'
  bound_at: string
}

export const useCoupleStore = defineStore('couple', () => {
  const couple = ref<Couple | null>(null)
  const inviteCode = ref<string>('')
  const loading = ref(false)

  async function fetchCouple(userId: string) {
    const { data } = await supabase
      .from('couples')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'active')
      .maybeSingle()
    couple.value = data
  }

  async function generateInviteCode() {
    loading.value = true
    try {
      const res = await api.post('/api/invite/generate')
      inviteCode.value = res.data.inviteCode
      return res.data.inviteCode
    } finally {
      loading.value = false
    }
  }

  async function acceptInvite(code: string, options?: { species?: 'cat' | 'dog' | 'rabbit'; petName?: string }) {
    loading.value = true
    try {
      const res = await api.post('/api/invite/accept', {
        code,
        species: options?.species ?? 'cat',
        petName: options?.petName,
      })
      // 绑定成功后刷新宠物数据
      const petStore = usePetStore()
      petStore.pet = res.data.pet
      return res.data
    } finally {
      loading.value = false
    }
  }

  return { couple, inviteCode, loading, fetchCouple, generateInviteCode, acceptInvite }
})
