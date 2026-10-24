
<script setup>
import { reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { notificacao } from '@/services/notificacaoService'
import appArrow from '../layout/appArrow.vue'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'
import StepIndicator from '../layout/StepIndicator.vue'

const userStore = useUserStore()
const router = useRouter()

const emit = defineEmits(['ir-para-login'])

const user = reactive({
  email: '',
  password: '',
  name: null,
  foto: null,
})

const confirmPassword = ref('')
const loading = ref(false)
const erroMessage = ref('')
const erroFoto = ref('')
const fotoPreview = ref('')
const fotoInput = ref(null)

function selecionarFoto() {
  fotoInput.value?.click()
}

function alterarFoto(event) {
  const arquivo = event.target.files?.[0]

  if (!arquivo) return

  erroFoto.value = ''

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
    erroFoto.value = 'Selecione uma imagem JPG, PNG ou WEBP.'
    event.target.value = ''
    return
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    erroFoto.value = 'A imagem deve ter no máximo 5 MB.'
    event.target.value = ''
    return
  }

  if (fotoPreview.value) {
    URL.revokeObjectURL(fotoPreview.value)
  }

  user.foto = arquivo
  fotoPreview.value = URL.createObjectURL(arquivo)
}

onBeforeUnmount(() => {
  if (fotoPreview.value) {
    URL.revokeObjectURL(fotoPreview.value)
  }
})

async function register() {
  if (loading.value) return

  erroMessage.value = ''

  if (user.password !== confirmPassword.value) {
    erroMessage.value = 'As senhas não coincidem.'
    notificacao.aviso(erroMessage.value)
    return
  }

  loading.value = true

  try {
    await userStore.register(user.email, user.password, user.name, user.foto)
    notificacao.sucesso('Cadastro realizado com sucesso.')

    await router.replace({ name: 'verification' })
  } catch {
    erroMessage.value = 'Não foi possível fazer o cadastro. Tente novamente.'
    notificacao.erro(erroMessage.value)
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
      <AppInput
        label="Nome completo"
        placeholder="Maria Silva"
        v-model="user.name"
      />

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

      <div class="photo-field">
        <label for="foto-perfil" class="photo-label">
          Foto de perfil <span>(opcional)</span>
        </label>

        <div class="photo-content">
          <button
            type="button"
            class="photo-avatar"
            aria-label="Selecionar foto de perfil"
            @click="selecionarFoto"
          >
            <img
              v-if="fotoPreview"
              :src="fotoPreview"
              alt="Prévia da foto de perfil"
            />

            <span v-else class="mdi mdi-account"></span>
          </button>

          <div class="photo-actions">
            <button
              type="button"
              class="photo-button"
              @click="selecionarFoto"
            >
              <span class="mdi mdi-upload-outline"></span>
              {{ user.foto ? 'Alterar foto' : 'Adicionar foto' }}
            </button>

            <p class="photo-description">
              JPG, PNG ou WEBP. Tamanho máximo de 5MB.
            </p>
          </div>
        </div>

        <input
          id="foto-perfil"
          ref="fotoInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="photo-input"
          @change="alterarFoto"
        />

        <p v-if="erroFoto" class="photo-error" role="alert">
          {{ erroFoto }}
        </p>
      </div>

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

.photo-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 4px 0 18px;
}

.photo-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0a0f1c;
}

.photo-label span {
  font-size: 0.85rem;
  font-weight: 400;
  color: #687385;
}

.photo-content {
  display: flex;
  align-items: center;
  gap: 18px;
}

.photo-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  min-width: 68px;
  padding: 0;
  overflow: hidden;
  border: 1px solid #d8dfe8;
  border-radius: 50%;
  background: #e9edf2;
  color: #8b98a9;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.photo-avatar:hover {
  border-color: var(--azul);
  background: #e1e8f1;
}

.photo-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-avatar .mdi {
  font-size: 38px;
  line-height: 1;
}

.photo-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  min-width: 0;
}

.photo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid #aebed4;
  border-radius: 6px;
  background: #fff;
  color: var(--azul);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.photo-button:hover {
  background: #f2f6fb;
  border-color: var(--azul);
}

.photo-button .mdi {
  font-size: 17px;
}

.photo-description {
  margin: 0;
  color: #52637b;
  font-size: 0.76rem;
  line-height: 1.4;
}

.photo-input {
  display: none;
}

.photo-error {
  margin: 0;
  color: #d32f2f;
  font-size: 0.8rem;
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

@media (max-width: 700px) {
  .photo-content {
    gap: 14px;
  }

  .photo-avatar {
    width: 60px;
    height: 60px;
    min-width: 60px;
  }

  .photo-description {
    font-size: 0.72rem;
  }
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

  .register-form {
    width: 100%;
    min-width: 0;
  }

  .register-form :deep(.app-input) {
    margin-bottom: 1rem;
  }

  .register-form :deep(.label-class),
  .photo-field {
    font-size: 0.9375rem;
  }

  .register-form :deep(.input-class) {
    min-width: 0;
    min-height: 48px;
    font-size: 16px;
  }

  .register-form :deep(.password-toggle) {
    min-width: 44px;
    min-height: 44px;
  }

  .photo-field,
  .photo-field input {
    width: 100%;
    min-width: 0;
  }

  .photo-field input {
    font-size: 16px;
  }

  .photo-field input::file-selector-button {
    min-height: 44px;
    max-width: 100%;
    margin-right: 0.5rem;
    padding: 0.5rem;
    font: inherit;
  }

  .register-form :deep(.app-button) {
    width: 100%;
    min-height: 48px;
    margin-block: 0.5rem 0;
    font-size: 1rem;
  }

  .photo-content {
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .photo-actions {
    align-items: center;
    text-align: center;
  }

  .photo-button {
    justify-self: center;
  }

  .container > :deep(.step-indicator) {
    width: 100%;
    margin-top: 1.5rem;
    gap: 0.5rem;
  }
}

</style>
