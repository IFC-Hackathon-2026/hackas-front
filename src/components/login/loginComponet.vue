<script setup>
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppButton from '@/components/forms/AppButton.vue';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const erroMessage = ref('');

async function login() {
  loading.value = true;
  erroMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    await router.replace({ name: 'home' });
  } catch {
    erroMessage.value = 'Não foi possível entrar. Confira seus dados e tente novamente.';
  } finally {
    loading.value = false;
  }
}

const emit = defineEmits(['ir-para-cadastro']);
</script>

<template>
  <div class="container">
    <div class="container-title">
      <img class="logo" src="/FarolFlow-logo-light.svg" alt="Logo" />
      <h1>BEM VINDO DE VOLTA!</h1>
      <p>Faça login para acessar sua conta</p>
    </div>

    <form @submit.prevent="login" class="login-form">
      <div class="field">
        <label for="email">E-mail</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="exemplo@gmail.com"
          autocomplete="email"
          required
        />
      </div>

      <div class="field">
        <label for="senha">Senha</label>
        <div class="password-wrapper">
          <input
            id="senha"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Digite sua senha"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="toggle-password"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5C6.5 5 2.1 8.4 1 12c1.1 3.6 5.5 7 11 7s9.9-3.4 11-7c-1.1-3.6-5.5-7-11-7Zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/>
            </svg>
            <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5C6.5 5 2.1 8.4 1 12c1.1 3.6 5.5 7 11 7s9.9-3.4 11-7c-1.1-3.6-5.5-7-11-7Zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"/>
              <path d="M3 3l18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <p v-if="erroMessage" class="error">{{ erroMessage }}</p>

      <AppButton type="submit" :disabled="loading" class="btn-entrar">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </AppButton>

      <RouterLink to="/esqueci-senha" class="forgot">Esqueceu sua senha?</RouterLink>
    </form>

    <p class="signup">
      Não possui uma conta?
       <a href="#" @click.prevent="emit('ir-para-cadastro')">Cadastre-se.</a>
    </p>
  </div>
</template>

<style scoped>
.container {
  --azul: var(--primaria, #00265c);

  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 1.25rem 0;
  box-sizing: border-box;
}

.container-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1rem;
}

.logo {
  width: 190px;
  height: auto;
  margin-bottom: 1rem;
}

.container-title h1 {
  font-size: clamp(1.5rem, 5vw, 1.85rem);
  font-weight: 700;
  color: #111;
  margin: 0 0 0.5rem;
}

.container-title p {
  color: var(--azul);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.field label {
  font-weight: 700;
  font-size: 1.05rem;
  color: #0a0f1c;
  margin-bottom: 0.375rem;
}

.field input {
  width: 100%;
  height: 48px;
  padding: 0 1.25rem;
  border: 1px solid #5b7399;
  border-radius: 6px;
  font-size: 1rem;
  color: var(--azul);
  background: #fff;
  box-sizing: border-box;
}

.field input:focus {
  outline: 2px solid var(--azul);
  outline-offset: 1px;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 3.5rem;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--azul);
  padding: 0;
}

.error {
  color: #d32f2f;
  margin: 0 0 1rem;
}


.forgot {
  align-self: center;
  margin-top: 1.25rem;
  color: var(--azul);
  text-decoration: none;
}
.btn-entrar{
    margin-top: 10px;
}
.signup {
  text-align: center;
  margin-top: 1.5rem;
  color: #0a0f1c;
}

.signup a {
  color: var(--azul);
  font-weight: 700;
  text-decoration: none;
}

.forgot:hover,
.signup a:hover {
  text-decoration: underline;
}

.login-form :deep(.app-button) {
  height: 48px;
  font-size: 1rem;
}

@media (max-height: 700px) {
  .container {
    padding-block: 1rem;
  }

  .logo {
    width: 160px;
    margin-bottom: 0.75rem;
  }

  .container-title {
    margin-bottom: 1rem;
  }
}
</style>