<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppInput from '@/components/AppInput.vue';
import AppButton from '@/components/AppButton.vue';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);

const erroMessage = ref('');

async function login() {
  loading.value = true;
  erroMessage.value = '';
  try {
    await authStore.login(email.value, password.value)
    await router.replace({ name: 'home' })
  } catch {
    erroMessage.value = 'Não foi possível entrar. Confira seus dados e tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
<div class="container">
  <div class="container-title">
    <h1 style="font-weight: bold;">ENTRAR</h1>
    <p>Digite seu email e sua senha para fazer o login</p>
  </div>

  <form @submit.prevent="login" class="login-form">

    <AppInput
      label="Email"
      placeholder="Digite seu email"
      v-model="email"
      type="email"
      required
    />

    <AppInput
      label="Senha"
      placeholder="Digite sua senha"
      v-model="password"
      type="password"
      required
    />

    <p v-if="erroMessage" style="color: red; margin-bottom: 1rem;">{{ erroMessage }}</p>
    <AppButton type="submit" :disabled="loading">
      {{ loading ? 'Entrando...' : 'Entrar' }}
    </AppButton>
  </form>
  <RouterLink style="margin-top: 1rem;" to="/cadastro">Não tem uma conta? Cadastre-se aqui.</RouterLink>
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

.login-form {
  display: flex;
  flex-direction: column;
}
</style>
