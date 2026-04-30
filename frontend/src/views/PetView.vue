<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/stores/pet'
import type { RealtimeChannel } from '@supabase/supabase-js'

const petStore = usePetStore()
const router = useRouter()
const chatInput = ref('')
const chatLoading = ref(false)
const actionMsg = ref('')
let channel: RealtimeChannel | null = null

onMounted(async () => {
  if (!petStore.pet) {
    await petStore.fetchPet()
  }
  if (petStore.pet) {
    channel = petStore.subscribeRealtime(petStore.pet.id)
  }
})

onUnmounted(() => {
  channel?.unsubscribe()
})

async function doFeed() {
  const delta = await petStore.feed()
  showActionMsg(`喂食成功！饥饿度 +${delta.hunger} 🍖`)
}

async function doPet() {
  const delta = await petStore.petAction()
  showActionMsg(`抚摸了宠物！心情 +${delta.mood} 💕`)
}

async function doChat() {
  if (!chatInput.value.trim()) return
  chatLoading.value = true
  const msg = chatInput.value
  chatInput.value = ''
  await petStore.chat(msg)
  chatLoading.value = false
}

function showActionMsg(msg: string) {
  actionMsg.value = msg
  setTimeout(() => { actionMsg.value = '' }, 2000)
}
</script>

<template>
  <div class="pet-page">
    <header>
      <button @click="router.back()">← 返回</button>
      <h2>{{ petStore.pet?.name ?? '...' }}</h2>
      <span></span>
    </header>

    <div v-if="petStore.pet" class="content">
      <!-- 宠物展示区 -->
      <div class="pet-display">
        <div class="pet-avatar">🐱</div>
        <div class="action-msg" :class="{ visible: !!actionMsg }">{{ actionMsg }}</div>
        <div class="intimacy">💕 亲密度 {{ petStore.pet.intimacy }}</div>
      </div>

      <!-- 状态条 -->
      <div class="stats">
        <div class="stat-item">
          <span>🍖 饥饿</span>
          <div class="bar"><div class="fill" :style="{ width: petStore.pet.hunger + '%' }" /></div>
          <span class="val">{{ petStore.pet.hunger }}</span>
        </div>
        <div class="stat-item">
          <span>😊 心情</span>
          <div class="bar"><div class="fill mood" :style="{ width: petStore.pet.mood + '%' }" /></div>
          <span class="val">{{ petStore.pet.mood }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button class="action-btn feed" @click="doFeed">🍖 喂食</button>
        <button class="action-btn pet" @click="doPet">✋ 抚摸</button>
      </div>

      <!-- 对话区 -->
      <div class="chat-section">
        <h4>💬 和 {{ petStore.pet.name }} 说话</h4>
        <div class="chat-messages">
          <div
            v-for="(msg, i) in petStore.chatMessages"
            :key="i"
            :class="['message', msg.role]"
          >{{ msg.content }}</div>
        </div>
        <div class="chat-input">
          <input
            v-model="chatInput"
            type="text"
            placeholder="说点什么..."
            :disabled="chatLoading"
            @keyup.enter="doChat"
          />
          <button :disabled="chatLoading" @click="doChat">发送</button>
        </div>
      </div>
    </div>

    <div v-else class="loading">加载中...</div>
  </div>
</template>

<style scoped>
.pet-page { min-height: 100vh; background: #fff8f5; display: flex; flex-direction: column; }
header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
header button { border: none; background: none; cursor: pointer; color: #ff7043; }
header h2 { margin: 0; }
.content { padding: 20px; flex: 1; }
.pet-display { text-align: center; padding: 24px 0; position: relative; }
.pet-avatar { font-size: 6rem; line-height: 1; }
.action-msg { height: 24px; color: #ff7043; font-size: 0.9rem; margin-top: 8px; opacity: 0; transition: opacity 0.3s; }
.action-msg.visible { opacity: 1; }
.intimacy { color: #ab47bc; font-size: 0.9rem; margin-top: 4px; }
.stats { background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.stat-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.stat-item span { font-size: 0.85rem; width: 60px; flex-shrink: 0; }
.bar { flex: 1; height: 10px; background: #f0f0f0; border-radius: 5px; }
.fill { height: 100%; background: #ff7043; border-radius: 5px; transition: width 0.5s; }
.fill.mood { background: #ab47bc; }
.val { font-size: 0.85rem; color: #aaa; width: 28px; text-align: right; }
.actions { display: flex; gap: 12px; margin-bottom: 20px; }
.action-btn { flex: 1; padding: 14px; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; font-weight: bold; }
.action-btn.feed { background: #fff3e0; color: #ff7043; }
.action-btn.pet { background: #fce4ec; color: #e91e63; }
.chat-section { background: white; border-radius: 16px; padding: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.chat-section h4 { margin: 0 0 12px; }
.chat-messages { min-height: 120px; max-height: 200px; overflow-y: auto; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
.message { max-width: 75%; padding: 10px 14px; border-radius: 16px; font-size: 0.9rem; }
.message.user { background: #ff7043; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
.message.pet { background: #f5f5f5; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; }
.chat-input { display: flex; gap: 8px; }
.chat-input input { flex: 1; padding: 10px 14px; border: 1px solid #eee; border-radius: 10px; outline: none; font-size: 0.9rem; }
.chat-input button { padding: 10px 16px; background: #ff7043; color: white; border: none; border-radius: 10px; cursor: pointer; }
.loading { flex: 1; display: flex; align-items: center; justify-content: center; color: #aaa; }
</style>
