<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCoupleStore } from '@/stores/couple'

const coupleStore = useCoupleStore()
const router = useRouter()

const mode = ref<'none' | 'generate' | 'accept'>('none')
const acceptCode = ref('')
const selectedSpecies = ref<'cat' | 'dog' | 'rabbit'>('cat')
const petName = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const copied = ref(false)

const petOptions = [
  { type: 'cat', icon: '🐱', label: '猫咪' },
  { type: 'dog', icon: '🐶', label: '狗狗' },
  { type: 'rabbit', icon: '🐰', label: '兔兔' },
] as const

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
    await coupleStore.acceptInvite(acceptCode.value, {
      species: selectedSpecies.value,
      petName: petName.value.trim(),
    })
    successMsg.value = '绑定成功！正在跳转...'
    setTimeout(() => router.push('/home'), 1500)
  } catch (e: any) {
    errorMsg.value = e.response?.data?.error || '绑定失败'
  }
}

function copyCode() {
  navigator.clipboard.writeText(coupleStore.inviteCode)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1200)
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
          <button class="copy-btn" @click="copyCode">{{ copied ? '已复制' : '复制' }}</button>
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
        <p>选择你们要共养的宠物：</p>
        <div class="pet-options">
          <button
            v-for="opt in petOptions"
            :key="opt.type"
            type="button"
            :class="['pet-option', { active: selectedSpecies === opt.type }]"
            @click="selectedSpecies = opt.type"
          >
            <span>{{ opt.icon }}</span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
        <input
          v-model="petName"
          type="text"
          placeholder="给宠物起个名字（可选）"
          maxlength="20"
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
.invite-page { min-height: 100%; background: var(--bg); display: flex; flex-direction: column; }
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px var(--space-3);
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}
header button {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--primary);
  min-height: 40px;
}
header h2 { margin: 0; font-size: 1.15rem; }
.content { flex: 1; width: 100%; max-width: var(--max-width); margin: 0 auto; padding: 32px var(--space-3); }
.success { text-align: center; color: #43a047; font-size: 1.1rem; padding: 40px; }
.choice { display: grid; grid-template-columns: 1fr; gap: 16px; }
.option-card {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  text-align: center;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: transform 0.1s;
}
.option-card:active { transform: scale(0.98); }
.icon { font-size: 2.5rem; margin-bottom: 12px; }
.option-card h3 { margin: 0 0 8px; }
.option-card p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
.code-display { text-align: center; padding: 20px 0; }
.code-box { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 20px 0; flex-wrap: wrap; }
.code { font-size: clamp(1.4rem, 7vw, 2rem); font-weight: 800; letter-spacing: 4px; color: var(--primary); word-break: break-all; }
.copy-btn {
  border: 1px solid var(--primary);
  background: none;
  color: var(--primary);
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  min-height: 40px;
}
.hint { color: var(--text-muted); font-size: 0.9rem; }
.accept-form { display: flex; flex-direction: column; gap: 12px; }
.accept-form input { min-height: 46px; padding: 12px; border: 1px solid #eee; border-radius: 12px; font-size: 1.1rem; text-align: center; letter-spacing: 3px; outline: none; }
.pet-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.pet-option {
  min-height: 44px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 700;
  cursor: pointer;
}
.pet-option.active {
  border-color: var(--primary);
  color: var(--primary);
  background: #fff4f4;
}
.error { color: #e53935; font-size: 0.85rem; }
.primary-btn { min-height: 44px; padding: 10px 14px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 1rem; cursor: pointer; }
.primary-btn:disabled { opacity: 0.6; }

@media (min-width: 768px) {
  header {
    padding-inline: var(--space-4);
  }
  .content {
    max-width: var(--container-max-tablet);
    padding-inline: var(--space-4);
  }
  .choice {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  header {
    padding-inline: var(--space-5);
  }
  .content {
    max-width: var(--container-max-desktop);
    padding-inline: var(--space-5);
  }
}
</style>
