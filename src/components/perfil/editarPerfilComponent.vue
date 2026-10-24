
<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import UserService from '@/services/userService'
import api from '@/api/config'

const userStore = useUserStore()
const userService = new UserService()

const form = reactive({ name: '', email: '' })
const fetching = ref(true)
const ready = ref(false)
const photoInput = ref(null)
const file = ref(null)
const previewUrl = ref('')
const photoFailed = ref(false)
const loading = ref(false)
const error = ref('')
const message = ref('')

const fotoAtual = computed(() => {
  const url = userStore.user?.foto?.url
  if (!url) return ''
  if (url.startsWith('http')) return url

  return new URL(
    url,
    new URL(api.defaults.baseURL, window.location.origin).origin
  ).href
})

const fotoExibida = computed(() => previewUrl.value || fotoAtual.value)

onMounted(async () => {
  try {
    const user = await userStore.getMe()
    form.name = user.name ?? ''
    form.email = user.email ?? ''
    ready.value = true
  } catch {
    error.value = 'Não foi possível carregar seu perfil.'
  } finally {
    fetching.value = false
  }
})

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function selecionarFoto(event) {
  error.value = ''
  message.value = ''
  photoFailed.value = false

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  file.value = event.target.files?.[0] ?? null
  previewUrl.value = file.value ? URL.createObjectURL(file.value) : ''
}

async function saveProfile() {
  if (!ready.value || fetching.value || loading.value) return

  error.value = ''
  message.value = ''

  if (!form.name.trim() || !form.email.trim()) {
    error.value = 'Preencha o nome e o e-mail.'
    return
  }

  if (file.value && !['image/jpeg', 'image/png'].includes(file.value.type)) {
    error.value = 'Selecione uma imagem PNG ou JPEG.'
    return
  }

  if (file.value && file.value.size > 5 * 1024 * 1024) {
    error.value = 'A imagem deve ter no máximo 5MB.'
    return
  }

  loading.value = true

  try {
    const data = {
      name: form.name.trim(),
      email: form.email.trim()
    }

    if (file.value) {
      const { data: image } = await userService.uploadImage(file.value)

      if (!image.attachment_key) {
        throw new Error('Upload sem chave da imagem.')
      }

      data.foto_attachment_key = image.attachment_key
    }

    const user = await userStore.updateMe(data)

    form.name = user.name ?? ''
    form.email = user.email ?? ''

    file.value = null
    photoFailed.value = false

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }

    if (photoInput.value) photoInput.value.value = ''

    message.value = 'Perfil atualizado com sucesso.'
  } catch (requestError) {
    const data = requestError.response?.data

    const details = data && typeof data === 'object'
      ? Object.entries(data)
          .map(([field, messages]) =>
            `${({
              name: 'Nome',
              email: 'E-mail',
              foto_attachment_key: 'Foto',
              file: 'Foto'
            })[field] ?? field}: ${
              Array.isArray(messages) ? messages.join(' ') : messages
            }`
          )
          .join(' ')
      : ''

    error.value = details || 'Não foi possível salvar o perfil. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="editar-perfil">
    <h2>Informações pessoais</h2>

    <p v-if="fetching" class="feedback" role="status">
      Carregando perfil...
    </p>

    <form @submit.prevent="saveProfile" :aria-busy="fetching || loading">
      <div class="campos">
        <div class="campo">
          <label for="profile-name">Nome completo</label>
          <input
            id="profile-name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            required
            :disabled="!ready || loading"
          />
        </div>

        <div class="campo">
          <label for="profile-email">E-mail</label>
          <input
            id="profile-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            maxlength="255"
            :disabled="!ready || loading"
          />
        </div>
      </div>

      <div class="foto-box">
        <label for="profile-photo" class="foto-titulo">
          Foto de perfil
        </label>

        <div class="foto-conteudo">
          <div class="foto-preview">
            <img
              v-if="fotoExibida && !photoFailed"
              :src="fotoExibida"
              alt="Foto do perfil"
              @error="photoFailed = true"
            />
          </div>

          <div class="foto-acoes">
            <input
              ref="photoInput"
              id="profile-photo"
              class="input-arquivo"
              type="file"
              accept="image/jpeg,image/png"
              :disabled="!ready || loading"
              @change="selecionarFoto"
            />

            <label
              for="profile-photo"
              class="btn-alterar"
              :class="{ desabilitado: !ready || loading }"
            >
              <span class="mdi mdi-upload-outline"></span>
              Alterar foto
            </label>

            <small>JPG ou PNG. Tamanho máximo de 5MB.</small>
          </div>
        </div>
      </div>

      <p v-if="error" class="feedback erro" role="alert">
        {{ error }}
      </p>

      <p v-if="message" class="feedback sucesso" role="status">
        {{ message }}
      </p>

      <div class="rodape-form">
        <button
          type="submit"
          class="btn-salvar"
          :disabled="!ready || loading"
        >
          {{ loading ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.editar-perfil {
  --azul: var(--primaria, #01295f);
  --borda: #8da4c7;
  width: 100%;
  color: var(--azul);
}

.editar-perfil h2 {
  margin: 0 0 2rem;
  font-size: 1.5rem;
  font-weight: 700;
}

form {
  display: flex;
  flex-direction: column;
}

.campos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.5rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  min-width: 0;
}

.campo label {
  color: #111;
  font-size: 1.05rem;
  font-weight: 700;
}

.campo input {
  width: 100%;
  height: 43px;
  box-sizing: border-box;
  padding: 0 1rem;
  border: 1px solid var(--borda);
  border-radius: 5px;
  background: #fff;
  color: #111;
  font-size: 1rem;
}

.campo input:focus {
  outline: 2px solid var(--azul);
  outline-offset: 1px;
}

.campo input:disabled {
  opacity: 0.6;
}

.foto-box {
  margin-top: 3.5rem;
  padding: 1rem 1.5rem 1.5rem;
  border: 1px solid var(--borda);
  border-radius: 5px;
  box-shadow: 0 5px 14px rgb(0 18 40 / 7%);
}
.foto-titulo {
  display: block;
  margin-bottom: 0.75rem;
  color: #111;
  font-size: 1.1rem;
  font-weight: 700;
}

.foto-conteudo {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.foto-preview {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  overflow: hidden;
  background: #d9d9d9;
}

.foto-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.foto-acoes {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.65rem;
}

.input-arquivo {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
}

.btn-alterar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 36px;
  padding: 0.35rem 1.2rem;
  border: 1px solid var(--borda);
  border-radius: 5px;
  background: #fff;
  color: var(--azul);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-alterar:hover {
  background: #f1f6fc;
}

.btn-alterar.desabilitado {
  opacity: 0.6;
  cursor: default;
}

.btn-alterar .mdi {
  font-size: 1.3rem;
}

.foto-acoes small {
  color: var(--azul);
  font-size: 0.85rem;
}

.rodape-form {
  display: flex;
  justify-content: flex-end;
  margin-top: 2.5rem;
}

.btn-salvar {
  min-height: 40px;
  padding: 0.6rem 1.2rem;
  border: 0;
  border-radius: 4px;
  background: var(--azul);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-salvar:hover:not(:disabled) {
  background: #082e64;
}

.btn-salvar:disabled {
  opacity: 0.6;
  cursor: default;
}

.feedback {
  margin: 1rem 0 0;
  font-size: 0.9rem;
}

.feedback.erro {
  color: #9f1c1c;
}

.feedback.sucesso {
  color: #176b35;
}

@media (max-width: 700px) {
  .editar-perfil h2 {
    margin-bottom: 1.5rem;
    font-size: 1.35rem;
  }

  .campos {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .foto-box {
    margin-top: 2rem;
    padding: 1rem;
  }

  .foto-conteudo {
    gap: 1rem;
  }

  .foto-preview {
    width: 72px;
    height: 72px;
  }

  .rodape-form {
    margin-top: 2rem;
  }
}

@media (max-width: 420px) {
  .foto-conteudo {
    gap: 0.75rem;
  }

  .foto-acoes small {
    font-size: 0.75rem;
  }

  .btn-salvar {
    width: 100%;
  }
}
</style>
