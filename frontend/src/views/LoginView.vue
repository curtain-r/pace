<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const nickname = ref('')
const errorMsg = ref('')
const loading = ref(false)

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    if (isLogin.value) {
      await authStore.signIn(email.value, password.value)
    } else {
      await authStore.signUp(email.value, password.value, nickname.value)
    }
    router.push('/home')
  } catch (e: any) {
    errorMsg.value = e.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="card">
      <h1>🐾 Pace</h1>
      <p class="subtitle">和 TA 一起养一只专属宠物</p>

      <div class="tabs">
        <button :class="{ active: isLogin }" @click="isLogin = true">登录</button>
        <button :class="{ active: !isLogin }" @click="isLogin = false">注册</button>
      </div>

      <form @submit.prevent="submit">
        <input v-if="!isLogin" v-model="nickname" type="text" placeholder="昵称" required />
        <input v-model="email" type="email" placeholder="邮箱" required />
        <input v-model="password" type="password" placeholder="密码" required minlength="6" />
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? '请稍候...' : isLogin ? '登录' : '注册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}
.card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 360px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}
h1 { font-size: 2rem; margin-bottom: 8px; }
.subtitle { color: #888; margin-bottom: 24px; font-size: 0.9rem; }
.tabs { display: flex; margin-bottom: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #eee; }
.tabs button { flex: 1; padding: 10px; border: none; background: #f9f9f9; cursor: pointer; font-size: 0.95rem; }
.tabs button.active { background: #ff7043; color: white; }
form { display: flex; flex-direction: column; gap: 12px; }
input { padding: 12px; border: 1px solid #eee; border-radius: 10px; font-size: 0.95rem; outline: none; }
input:focus { border-color: #ff7043; }
.error { color: #e53935; font-size: 0.85rem; }
.submit-btn { padding: 12px; background: #ff7043; color: white; border: none; border-radius: 10px; font-size: 1rem; cursor: pointer; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
