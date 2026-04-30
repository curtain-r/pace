import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'

export interface Pet {
  id: string
  couple_id: string
  name: string
  species: string
  personality: string
  hunger: number
  mood: number
  intimacy: number
  last_fed_at: string | null
  last_petted_at: string | null
  created_at: string
}

export const usePetStore = defineStore('pet', () => {
  const pet = ref<Pet | null>(null)
  const loading = ref(false)
  const chatMessages = ref<{ role: 'user' | 'pet'; content: string }[]>([])

  async function fetchPet() {
    loading.value = true
    try {
      const res = await api.get('/api/pet')
      pet.value = res.data.pet
    } finally {
      loading.value = false
    }
  }

  async function feed() {
    const res = await api.post('/api/pet/interact', { type: 'feed' })
    pet.value = res.data.pet
    return res.data.delta
  }

  async function petAction() {
    const res = await api.post('/api/pet/interact', { type: 'pet' })
    pet.value = res.data.pet
    return res.data.delta
  }

  async function chat(message: string) {
    chatMessages.value.push({ role: 'user', content: message })
    const res = await api.post('/api/chat', { message })
    chatMessages.value.push({ role: 'pet', content: res.data.reply })
    // 增加亲密度（本地同步）
    if (pet.value) pet.value.intimacy += 1
    return res.data.reply
  }

  // 订阅宠物实时变化（Supabase Realtime）
  function subscribeRealtime(petId: string) {
    return supabase
      .channel(`pet:${petId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pets', filter: `id=eq.${petId}` },
        (payload) => {
          if (pet.value) {
            pet.value = { ...pet.value, ...payload.new }
          }
        },
      )
      .subscribe()
  }

  return { pet, loading, chatMessages, fetchPet, feed, petAction, chat, subscribeRealtime }
})
