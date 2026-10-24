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

      <label class="photo-field">
        Foto do perfil (opcional)
        <input
          type="file"
          accept="image/jpeg,image/png"
          @change="user.foto = $event.target.files?.[0] ?? null"
        />
      </label>

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
.photo-field {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}
.photo-field input {
  max-width: 100%;
}

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

@media (max-width: 600px) {
  .container {
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: 100dvh;
    justify-content: flex-start;
    padding-top: max(1.5rem, env(safe-area-inset-top, 0px));
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 0px));
  }

  .container-title {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .container-title h1 {
    font-size: 1.5rem;
  }

  .container-title p {
    font-size: 0.875rem;
  }

  .register-form {
    width: 100%;
    min-width: 0;
  }

  .register-form :deep(.app-input) {
    min-width: 0;
    margin-bottom: 1rem;
  }

  .register-form :deep(.input-class) {
    min-height: 48px;
    font-size: 16px;
  }

  .register-form :deep(.app-button) {
    min-height: 48px;
    font-size: 1rem;
  }

  .container > a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    text-align: center;
    font-size: 0.875rem;
  }
}
</style>
