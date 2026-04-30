<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCoupleStore } from '@/stores/couple'

const coupleStore = useCoupleStore()
const router = useRouter()

const mode = ref<'none' | 'generate' | 'accept'>('none')
const acceptCode = ref('')
const errorMsg = ref('')
const successMsg = ref('')

async function generate() {
  errorMsg.value = ''
  try {
    await coupleStore.generateInviteCode()
    mode.value = 'generate'
  } catch (e: any) {
    errorMsg.value = e.response?.data?.error || '生成失败'
  }
}

async function accept() {
  errorMsg.value = ''
  try {
    await coupleStore.acceptInvite(acceptCode.value)
    successMsg.value = '绑定成功！正在跳转...'
    setTimeout(() => router.push('/home'), 1500)
  } catch (e: any) {
    errorMsg.value = e.response?.data?.error || '绑定失败'
  }
}

function copyCode() {
  navigator.clipboard.writeText(coupleStore.inviteCode)
}
</script>

<template>
  <div class="invite-page">
    <header>
      <button @click="router.back()">← 返回</button>
      <h2>💌 绑定伴侣</h2>
      <span></span>
    </header>

    <div class="content">
      <div v-if="successMsg" class="success">{{ successMsg }}</div>
      <div v-else-if="mode === 'none'" class="choice">
        <div class="option-card" @click="generate">
          <div class="icon">📨</div>
          <h3>生成邀请码</h3>
          <p>生成一个邀请码，发给 TA</p>
        </div>
        <div class="option-card" @click="mode = 'accept'">
          <div class="icon">💝</div>
          <h3>输入邀请码</h3>
          <p>输入 TA 给你的邀请码</p>
        </div>
      </div>

      <!-- 已生成邀请码 -->
      <div v-else-if="mode === 'generate'" class="code-display">
        <p>将这个邀请码发给 TA：</p>
        <div class="code-box">
          <span class="code">{{ coupleStore.inviteCode }}</span>
          <button class="copy-btn" @click="copyCode">复制</button>
        </div>
        <p class="hint">邀请码为一次性，请勿泄露给其他人 💌</p>
      </div>

      <!-- 输入邀请码 -->
      <div v-else-if="mode === 'accept'" class="accept-form">
        <p>输入 TA 的邀请码：</p>
        <input
          v-model="acceptCode"
          type="text"
          placeholder="例如：A1B2C3D4"
          maxlength="8"
          style="text-transform: uppercase"
        />
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <button class="primary-btn" :disabled="coupleStore.loading" @click="accept">
          {{ coupleStore.loading ? '绑定中...' : '确认绑定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.invite-page { min-height: 100vh; background: #fff8f5; display: flex; flex-direction: column; }
header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
header button { border: none; background: none; cursor: pointer; color: #ff7043; }
header h2 { margin: 0; }
.content { flex: 1; padding: 32px 20px; }
.success { text-align: center; color: #43a047; font-size: 1.1rem; padding: 40px; }
.choice { display: flex; flex-direction: column; gap: 16px; }
.option-card { background: white; border-radius: 16px; padding: 24px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.1s; }
.option-card:active { transform: scale(0.98); }
.icon { font-size: 2.5rem; margin-bottom: 12px; }
.option-card h3 { margin: 0 0 8px; }
.option-card p { margin: 0; color: #aaa; font-size: 0.85rem; }
.code-display { text-align: center; padding: 20px 0; }
.code-box { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 20px 0; }
.code { font-size: 2rem; font-weight: bold; letter-spacing: 6px; color: #ff7043; }
.copy-btn { border: 1px solid #ff7043; background: none; color: #ff7043; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.hint { color: #aaa; font-size: 0.85rem; }
.accept-form { display: flex; flex-direction: column; gap: 12px; }
.accept-form input { padding: 14px; border: 1px solid #eee; border-radius: 12px; font-size: 1.2rem; text-align: center; letter-spacing: 4px; outline: none; }
.error { color: #e53935; font-size: 0.85rem; }
.primary-btn { padding: 14px; background: #ff7043; color: white; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; }
.primary-btn:disabled { opacity: 0.6; }
</style>
