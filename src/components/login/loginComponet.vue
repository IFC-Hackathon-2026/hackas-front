
<script setup>
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import AppButton from '@/components/forms/AppButton.vue';
import appArrow from '../layout/appArrow.vue';

const userStore = useUserStore();
const router = useRouter();

const emit = defineEmits([
  'ir-para-cadastro',
  'login-sucesso'
]);

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const erroMessage = ref('');

function voltarParaHome() {
  router.push('/');
}

async function login() {
  if (loading.value) return;

  loading.value = true;
  erroMessage.value = '';

  try {
    await userStore.login(email.value, password.value);
    emit('login-sucesso');
  } catch {
    erroMessage.value = 'Não foi possível entrar. Confira seus dados e tente novamente.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container">
    <div class="back-button">
      <appArrow @back="voltarParaHome" />
    </div>

    <div class="container-title">
      <img
        class="logo"
        src="/FarolFlow-logo-light.svg"
        alt="Logo"
      />

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
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <span
              :class="showPassword ? 'mdi mdi-eye-off-outline' : 'mdi mdi-eye-outline'"
              aria-hidden="true"
            ></span>
          </button>
        </div>
      </div>

      <p v-if="erroMessage" class="error" role="alert">
        {{ erroMessage }}
      </p>

      <AppButton
        type="submit"
        :disabled="loading"
        class="btn-entrar"
      >
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </AppButton>

      <RouterLink to="/esqueci-senha" class="forgot">
        Esqueceu sua senha?
      </RouterLink>
    </form>

    <p class="signup">
      Não possui uma conta?

      <a
        href="#"
        @click.prevent="emit('ir-para-cadastro')"
      >
        Cadastre-se.
      </a>
    </p>
  </div>
</template>

<style scoped>
.container {
  --azul: var(--primaria, #00265c);

  position: relative;
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

.back-button {
  align-self: flex-start;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-left: -15px;
  margin-bottom: 0.5rem;
  background: none;
  border: none;
  padding: 0;
  color: #111;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
}

.back-button :deep(.arrow) {
  display: flex;
  align-items: center;
  line-height: 1;
  color: inherit;
}

.back-button:hover {
  color: var(--azul);
  transform: translateX(-3px);
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
  width: 100%;
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
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--azul);
  cursor: pointer;
}

.toggle-password .mdi {
  display: block;
  font-size: 24px;
  line-height: 1;
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

.btn-entrar {
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
}

@media (max-width: 600px) {
  .container {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
    padding-top: max(1rem, env(safe-area-inset-top, 0px));
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 0px));
  }

  .back-button {
    flex-shrink: 0;
    margin-left: 0;
    margin-bottom: 1rem;
  }

  .container-title {
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .logo {
    width: clamp(140px, 42vw, 170px);
    margin-bottom: 1rem;
  }

  .container-title h1 {
    font-size: clamp(1.25rem, 5.5vw, 1.65rem);
    line-height: 1.3;
  }

  .container-title p {
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .error {
    font-size: 0.875rem;
    overflow-wrap: anywhere;
  }

  .login-form,
  .field,
  .password-wrapper {
    width: 100%;
    min-width: 0;
  }

  .field label {
    font-size: 0.9375rem;
  }

  .field input {
    min-width: 0;
    min-height: 48px;
    padding-inline: 1rem;
    font-size: 16px;
  }

  .password-wrapper input {
    padding-right: 3.5rem;
  }

  .toggle-password {
    right: 0.25rem;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
  }

  .login-form :deep(.app-button) {
    width: 100%;
    min-height: 48px;
    font-size: 1rem;
  }

  .forgot,
  .signup a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
  }

  .forgot {
    margin-top: 0.75rem;
    font-size: 0.875rem;
  }

  .signup {
    margin-top: 1rem;
    font-size: 0.875rem;
  }
}


@media (max-width: 600px) {
  .logo {
    width: clamp(110px, 32vw, 132px);
  }
}
</style>
