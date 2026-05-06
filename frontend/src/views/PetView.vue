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
const actionType = ref<'feed' | 'pet' | ''>('')
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
  actionType.value = 'feed'
  await petStore.feed()
  showMsg('喂食成功！🍖 +饱腹感')
}

async function doPet() {
  actionType.value = 'pet'
  await petStore.petAction()
  showMsg('轻轻抚摸 ✋ +好心情')
}

async function doChat() {
  if (!chatInput.value.trim() || chatLoading.value) return
  chatLoading.value = true
  const msg = chatInput.value
  chatInput.value = ''
  await petStore.chat(msg)
  chatLoading.value = false
}

function showMsg(msg: string) {
  actionMsg.value = msg
  setTimeout(() => { actionMsg.value = ''; actionType.value = '' }, 2500)
}

function getPetMood(mood: number) {
  if (mood >= 70) return '😸'
  if (mood >= 40) return '😺'
  return '😿'
}

function getPetFace(species: string, mood: number) {
  if (species === 'dog') {
    return mood >= 40 ? '🐶' : '🐕'
  }
  if (species === 'rabbit') {
    return mood >= 40 ? '🐰' : '🐇'
  }
  return getPetMood(mood)
}
</script>

<template>
  <div class="page-layout">
    <header class="app-header">
      <div class="header-inner">
        <button class="btn btn-ghost back-btn" @click="router.back()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回
        </button>
        <h2 class="page-title">{{ petStore.pet?.name ?? '宠物' }}</h2>
        <div style="width: 64px;" />
      </div>
    </header>

    <main class="page-content">
      <div class="container">
        <div v-if="petStore.pet">
          <!-- 宠物展示 -->
          <div class="pet-showcase card">
            <div class="showcase-bg" />
            <div class="pet-big-avatar">
              <div class="pet-emoji">{{ getPetFace(petStore.pet.species, petStore.pet.mood) }}</div>
              <Transition name="bubble">
                <div v-if="actionMsg" class="action-bubble">{{ actionMsg }}</div>
              </Transition>
            </div>
            <div class="pet-stats-row">
              <div class="mini-stat">
                <span>🍖</span>
                <div class="mini-bar">
                  <div class="mini-fill hunger" :style="{ width: petStore.pet.hunger + '%' }" />
                </div>
                <span class="mini-val">{{ petStore.pet.hunger }}</span>
              </div>
              <div class="intimacy-pill">💕 {{ petStore.pet.intimacy }}</div>
              <div class="mini-stat">
                <span>😊</span>
                <div class="mini-bar">
                  <div class="mini-fill mood" :style="{ width: petStore.pet.mood + '%' }" />
                </div>
                <span class="mini-val">{{ petStore.pet.mood }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-btns">
            <button
              :class="['action-btn feed', { active: actionType === 'feed' }]"
              @click="doFeed"
            >
              <span class="action-btn-icon">🍖</span>
              <span class="action-btn-label">喂食</span>
              <span class="action-btn-sub">饥饿度 +30</span>
            </button>
            <button
              :class="['action-btn pet-btn', { active: actionType === 'pet' }]"
              @click="doPet"
            >
              <span class="action-btn-icon">✋</span>
              <span class="action-btn-label">抚摸</span>
              <span class="action-btn-sub">心情 +20</span>
            </button>
          </div>

          <!-- 聊天区域 -->
          <div class="chat-card card">
            <div class="chat-header">
              <span class="chat-icon">💬</span>
              <span class="chat-title">和 {{ petStore.pet.name }} 说话</span>
            </div>

            <div class="chat-messages" ref="chatBox">
              <div v-if="petStore.chatMessages.length === 0" class="chat-empty">
                <p>试着跟 {{ petStore.pet.name }} 打个招呼吧～</p>
              </div>
              <div
                v-for="(msg, i) in petStore.chatMessages"
                :key="i"
                :class="['message', msg.role]"
              >
                <div v-if="msg.role === 'pet'" class="msg-avatar">{{ getPetFace(petStore.pet.species, petStore.pet.mood) }}</div>
                <div class="msg-bubble">{{ msg.content }}</div>
              </div>
            </div>

            <div class="chat-input-row">
              <input
                v-model="chatInput"
                class="input chat-input"
                type="text"
                placeholder="说点什么..."
                :disabled="chatLoading"
                @keyup.enter="doChat"
              />
              <button class="send-btn" :disabled="chatLoading || !chatInput.trim()" @click="doChat">
                <span v-if="chatLoading" class="spinner-sm" />
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="loading-placeholder">
          <div class="loading-spinner" />
          <p>正在唤醒小可爱...</p>
        </div>
      </div>
    </main>

  </div>
</template>

<style scoped>
.page-layout { min-height: 100%; display: flex; flex-direction: column; background: var(--bg); }

.app-header {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 50;
}
.header-inner {
  max-width: var(--container-max-desktop); margin: 0 auto;
  padding: 12px var(--space-3);
  display: flex; align-items: center; justify-content: space-between;
}
.back-btn { padding: 8px 12px; font-size: 0.9rem; color: var(--primary); gap: 4px; }
.page-title { font-size: 1.1rem; font-weight: 800; }

.page-content { flex: 1; padding: var(--space-3) 0 var(--space-4); }
.container { display: flex; flex-direction: column; gap: 14px; }

/* 宠物展示 */
.pet-showcase {
  padding: 24px 20px 20px;
  position: relative; overflow: hidden; text-align: center;
}
.showcase-bg {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #fff0f5 0%, #f3e8ff 100%);
}
.pet-big-avatar {
  position: relative; z-index: 1;
  display: inline-block; margin-bottom: 20px;
}
.pet-emoji {
  font-size: 5rem; line-height: 1;
  filter: drop-shadow(0 8px 20px rgba(255,107,107,0.25));
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.action-bubble {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  background: white; border-radius: 999px; padding: 6px 14px;
  font-size: 0.85rem; font-weight: 700; color: var(--primary);
  white-space: nowrap; box-shadow: 0 4px 16px rgba(255,107,107,0.2);
  border: 1px solid var(--border);
}
.action-bubble::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border: 6px solid transparent; border-top-color: white;
}

.pet-stats-row {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 10px;
}
.mini-stat { flex: 1; display: flex; align-items: center; gap: 6px; font-size: 0.8rem; }
.mini-bar { flex: 1; height: 6px; background: rgba(0,0,0,0.08); border-radius: 999px; overflow: hidden; }
.mini-fill { height: 100%; border-radius: 999px; transition: width 0.6s; }
.mini-fill.hunger { background: linear-gradient(90deg, #ff9a9e, #ff6b6b); }
.mini-fill.mood { background: linear-gradient(90deg, #c084fc, #9333ea); }
.mini-val { font-weight: 800; color: var(--text-muted); width: 24px; text-align: right; }
.intimacy-pill {
  background: white; border-radius: 999px; padding: 4px 12px;
  font-size: 0.8rem; font-weight: 800; color: var(--primary);
  box-shadow: 0 2px 8px rgba(255,107,107,0.15); white-space: nowrap; flex-shrink: 0;
}

/* 操作按钮 */
.action-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.action-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 20px 16px;
  border: 2px solid transparent; border-radius: var(--radius);
  background: white; cursor: pointer; transition: all 0.2s;
  box-shadow: var(--shadow);
  font-family: 'Nunito', sans-serif;
}
.action-btn:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.action-btn:active { transform: scale(0.97); }
.action-btn.feed { border-color: #ffd3d3; }
.action-btn.pet-btn { border-color: #e9d5ff; }
.action-btn.active { transform: scale(0.97); }
.action-btn-icon { font-size: 1.8rem; }
.action-btn-label { font-size: 1rem; font-weight: 800; color: var(--text); }
.action-btn-sub { font-size: 0.75rem; color: var(--text-muted); }

/* 聊天区域 */
.chat-card { padding: 0; overflow: hidden; }
.chat-header {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  background: #fafafa;
}
.chat-icon { font-size: 1.1rem; }
.chat-title { font-size: 0.95rem; font-weight: 800; color: var(--text); }
.chat-messages {
  min-height: 140px; max-height: 260px; overflow-y: auto;
  padding: 16px; display: flex; flex-direction: column; gap: 10px;
}
.chat-empty { display: flex; align-items: center; justify-content: center; height: 100px; }
.chat-empty p { color: var(--text-muted); font-size: 0.85rem; }
.message { display: flex; align-items: flex-end; gap: 8px; }
.message.user { flex-direction: row-reverse; }
.msg-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; }
.msg-bubble {
  max-width: 75%; padding: 10px 14px; border-radius: 16px;
  font-size: 0.9rem; line-height: 1.5;
}
.message.user .msg-bubble { background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white; border-bottom-right-radius: 4px; }
.message.pet .msg-bubble { background: #f5f5f5; color: var(--text); border-bottom-left-radius: 4px; }
.chat-input-row {
  display: flex; gap: 10px; padding: 12px 16px;
  border-top: 1px solid var(--border); background: white;
}
.chat-input { flex: 1; padding: 10px 14px; border-radius: 999px; font-size: 0.9rem; }
.send-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: white; flex-shrink: 0; transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(255,107,107,0.35);
}
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.send-btn:not(:disabled):hover { transform: scale(1.1); }

.spinner-sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 加载 */
.loading-placeholder { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; color: var(--text-muted); }
.loading-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }

/* 动画 */
.bubble-enter-active, .bubble-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-enter-from, .bubble-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.8); }

@media (min-width: 768px) {
  .header-inner {
    padding: 14px var(--space-4);
  }

  .page-content {
    padding-top: var(--space-4);
  }

  .container > div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-4);
    align-items: start;
  }

  .pet-showcase,
  .chat-card {
    grid-column: 1 / -1;
  }

  .action-btns {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .header-inner {
    padding-inline: var(--space-5);
  }

  .container > div {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  }

  .pet-showcase {
    grid-column: 1 / 2;
  }

  .action-btns {
    grid-column: 2 / 3;
    align-content: start;
  }

  .chat-card {
    grid-column: 1 / -1;
  }
}
</style>
