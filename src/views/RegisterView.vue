<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'

const userStore = useUserStore()
const router = useRouter()

const user = reactive({
  email: '',
  password: '',
  name: null,
  foto: null,
})

const confirmPassword = ref('')

const loading = ref(false)
const erroMessage = ref('')

async function register() {
  if (loading.value) return
  erroMessage.value = ''
  if (user.password !== confirmPassword.value) {
    erroMessage.value = 'As senhas não coincidem.'
    return
  }
  loading.value = true
  try {
    await userStore.register(user.email, user.password, user.name, user.foto)
    await router.replace({ name: 'eventos' })
  } catch {
    erroMessage.value = 'Não foi possível fazer o cadastro. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="container-title">
      <h1 style="font-weight: bold">CADASTRAR</h1>
      <p>Digite seus dados e crie sua conta</p>
    </div>

    <form @submit.prevent="register" class="register-form">
      <AppInput
        label="Email"
        placeholder="Digite seu email"
        v-model="user.email"
        type="email"
        required
      />

      <AppInput label="Nome Completo" placeholder="Digite seu nome" v-model="user.name" />

      <AppInput
        label="Senha"
        placeholder="Digite sua senha"
        v-model="user.password"
        type="password"
        required
      />

      <AppInput
        label="Confirme sua senha"
        placeholder="Digite sua senha novamente."
        v-model="confirmPassword"
        type="password"
        required
      />

      <p v-if="erroMessage" role="alert" style="color: red; margin-bottom: 1rem">
        {{ erroMessage }}
      </p>
      <AppButton type="submit" :disabled="loading">
        {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
      </AppButton>
    </form>
    <RouterLink style="margin-top: 1rem" to="/login">Já possui uma conta? Entre aqui.</RouterLink>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
  margin: 0 auto;
  height: 100vh;
}

.container-title {
  display: flex;
  flex-direction: column;
  align-items: center;

  & p {
    color: #9a9a9a;
  }
}

.register-form {
  display: flex;
  flex-direction: column;
}
</style>
