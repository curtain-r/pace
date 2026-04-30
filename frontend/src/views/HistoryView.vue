<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const authStore = useAuthStore()
const router = useRouter()

interface HistoryItem {
  id: string
  couple_id: string
  role: 'inviter' | 'invitee'
  joined_at: string
  left_at: string | null
}

const history = ref<HistoryItem[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!authStore.user) return
  const { data } = await supabase
    .from('couple_histories')
    .select('*')
    .eq('user_id', authStore.user.id)
    .order('joined_at', { ascending: false })
  history.value = data ?? []
  loading.value = false
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}
</script>

<template>
  <div class="history-page">
    <header>
      <button @click="router.back()">← 返回</button>
      <h2>📖 绑定历史</h2>
      <span></span>
    </header>

    <div class="content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="history.length === 0" class="empty">暂无绑定记录</div>
      <div v-else class="list">
        <div v-for="item in history" :key="item.id" class="history-card">
          <div class="role-badge" :class="item.role">
            {{ item.role === 'inviter' ? '📨 我发起的' : '💝 我接受的' }}
          </div>
          <div class="date">绑定于 {{ formatDate(item.joined_at) }}</div>
          <div v-if="item.left_at" class="date end">结束于 {{ formatDate(item.left_at) }}</div>
          <div v-else class="active-tag">💕 当前关系</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page { min-height: 100vh; background: #fff8f5; display: flex; flex-direction: column; }
header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
header button { border: none; background: none; cursor: pointer; color: #ff7043; }
header h2 { margin: 0; }
.content { flex: 1; padding: 20px; }
.loading, .empty { text-align: center; padding: 60px; color: #aaa; }
.list { display: flex; flex-direction: column; gap: 12px; }
.history-card { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.role-badge { font-size: 0.9rem; margin-bottom: 8px; }
.role-badge.inviter { color: #ff7043; }
.role-badge.invitee { color: #ab47bc; }
.date { color: #888; font-size: 0.85rem; }
.date.end { color: #bbb; margin-top: 4px; }
.active-tag { color: #43a047; font-size: 0.85rem; margin-top: 4px; }
</style>
