
<script setup>
import { reactive, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import appArrow from '../layout/appArrow.vue';
import AppInput from '@/components/forms/AppInput.vue';
import AppButton from '@/components/forms/AppButton.vue';
import StepIndicator from '../layout/StepIndicator.vue';

const userStore = useUserStore();

const emit = defineEmits([
  'ir-para-login',
  'cadastro-sucesso'
]);

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
  if (loading.value) return;

  erroMessage.value = '';

  if (user.password !== confirmPassword.value) {
    erroMessage.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true;

  try {
    await userStore.register(
      user.email,
      user.password,
      user.name,
      user.foto
    );

    emit('cadastro-sucesso');
  } catch {
    erroMessage.value = 'Não foi possível fazer o cadastro. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <button
      type="button"
      class="back-button"
      aria-label="Voltar para o login"
      @click="emit('ir-para-login')"
    >
      <appArrow aria-hidden="true" />
    </button>

    <div class="container-title">
      <img class="logo" src="/FarolFlow-logo-light.svg" alt="Logo" />
      <h1>CRIE SUA CONTA.</h1>
      <p>Preencha os dados abaixo para começar.</p>
    </div>

    <form @submit.prevent="register" class="register-form">
      <AppInput label="Nome completo" placeholder="Maria Silva" v-model="user.name" />

      <AppInput
        label="E-mail"
        placeholder="exemplo@gmail.com"
        v-model="user.email"
        type="email"
        required
      />

      <AppInput
        label="Senha"
        placeholder="Digite sua senha"
        v-model="user.password"
        type="password"
        required
      />

      <AppInput
        label="Confirmar senha"
        placeholder="Digite sua senha novamente"
        v-model="confirmPassword"
        type="password"
        required
      />

      <p v-if="erroMessage" role="alert" class="error">
        {{ erroMessage }}
      </p>

      <AppButton type="submit" :disabled="loading">
        {{ loading ? 'Cadastrando...' : 'Continuar' }}
      </AppButton>
    </form>

    <StepIndicator />
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
  transition:
    color 0.3s ease,
    transform 0.3s ease;
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
  margin-bottom: 1.5rem;
}

.logo {
  width: 190px;
  height: auto;
  margin-bottom: 1.25rem;
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

.register-form {
  display: flex;
  flex-direction: column;
}

.register-form :deep(.label-class) {
  font-weight: 700;
  font-size: 1.05rem;
  color: #0a0f1c;
  margin-bottom: 0.375rem;
}

.register-form :deep(.input-class) {
  height: 48px;
  border: 1px solid #5b7399;
  border-radius: 6px;
  color: var(--azul);
  font-size: 1rem;
}

.register-form :deep(.input-class:hover) {
  border-color: var(--azul);
}

.register-form :deep(.input-class:focus) {
  border-color: var(--azul);
  box-shadow: 0 0 0 4px rgba(0, 38, 92, 0.12);
}

.register-form :deep(.password-toggle) {
  color: var(--azul);
}

.error {
  color: #d32f2f;
  margin: 0 0 1rem;
}

.steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: 1px solid var(--azul);
  border-radius: 50%;
  box-sizing: border-box;
  color: #fff;
}

.step-circle--done {
  background: var(--azul);
}

.step-label {
  color: var(--azul);
  font-weight: 700;
}

.step-line {
  flex: 1;
  max-width: 200px;
  height: 1px;
  margin-top: 28px;
  background: var(--azul);
}

.register-form :deep(.app-input) {
  margin-bottom: 0.875rem;
  min-width: 0;
}

.register-form :deep(.input-wrapper) {
  position: relative;
}

.register-form :deep(.input-class--password) {
  padding-right: 2.75rem;
}

.register-form :deep(.app-button) {
  margin: 15px 0;
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
