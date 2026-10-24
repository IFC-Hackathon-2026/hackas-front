<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import UserService from '@/services/userService'
import { notificacao } from '@/services/notificacaoService'


const userStore = useUserStore()
const userService = new UserService()
const form = reactive({ name: '', email: '' })
const fetching = ref(true)
const ready = ref(false)
const photoInput = ref(null)
const file = ref(null)
const loading = ref(false)
const error = ref('')
const message = ref('')

onMounted(async () => {
  try {
    const user = await userStore.getMe()
    form.name = user.name ?? ''
    form.email = user.email ?? ''
    ready.value = true
  } catch {
    error.value = 'Não foi possível carregar seu perfil.'
    notificacao.erro(error.value)
  } finally {
    fetching.value = false
  }
})

async function saveProfile() {
  if (!ready.value || fetching.value || loading.value) return
  error.value = ''
  message.value = ''
  if (!form.name.trim() || !form.email.trim()) {
    error.value = 'Preencha o nome e o e-mail.'
    notificacao.aviso(error.value)
    return
  }
  if (file.value && !['image/jpeg', 'image/png'].includes(file.value.type)) {
    error.value = 'Selecione uma imagem PNG ou JPEG.'
    notificacao.aviso(error.value)
    return
  }
  loading.value = true
  try {
    const data = { name: form.name.trim(), email: form.email.trim() }
    if (file.value) {
      const { data: image } = await userService.uploadImage(file.value)
      if (!image.attachment_key) throw new Error('Upload sem chave da imagem.')
      data.foto_attachment_key = image.attachment_key
    }
    const user = await userStore.updateMe(data)
    form.name = user.name ?? ''
    form.email = user.email ?? ''
    file.value = null
    if (photoInput.value) photoInput.value.value = ''
    notificacao.sucesso('Perfil atualizado com sucesso.')
  } catch (requestError) {
    const data = requestError.response?.data
    const details = data && typeof data === 'object'
      ? Object.entries(data).map(([field, messages]) =>
          `${({ name: 'Nome', email: 'E-mail', foto_attachment_key: 'Foto', file: 'Foto' })[field] ?? field}: ${Array.isArray(messages) ? messages.join(' ') : messages}`,
        ).join(' ')
      : ''
    error.value = details || 'Não foi possível atualizar o perfil.'
    notificacao.erro(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="profile">
    <h1>Meu perfil</h1>
    <p v-if="fetching" role="status">Carregando perfil...</p>
    <form @submit.prevent="saveProfile" :aria-busy="fetching || loading">
      <label for="profile-name">Nome completo</label>
      <input id="profile-name" v-model="form.name" type="text" autocomplete="name"
        required :disabled="!ready || loading" />
      <label for="profile-email">E-mail</label>
      <input id="profile-email" v-model="form.email" type="email" autocomplete="email"
        required maxlength="255" :disabled="!ready || loading" />
      <label for="profile-photo">Foto do perfil</label>
      <input
        ref="photoInput"
        id="profile-photo"
        type="file"
        accept="image/jpeg,image/png"
        :disabled="!ready || loading"
        @change="file = $event.target.files?.[0] ?? null; message = ''; error = ''"
      />
      <button type="submit" :disabled="!ready || loading">
        {{ loading ? 'Salvando...' : 'Salvar alterações' }}
      </button>
      <p v-if="error" role="alert">{{ error }}</p>
      <p v-if="message" role="status">{{ message }}</p>
    </form>
  </section>
</template>

<style scoped>
.profile {
  max-width: 480px;
  margin: 32px auto;
}
form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}
input {
  max-width: 100%;
}
input:not([type='file']) {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #5b7399;
  border-radius: 6px;
  background: #fff;
  color: var(--azul-escuro);
}
button {
  padding: 8px 16px;
  border: 0;
  border-radius: 6px;
  background: var(--primaria);
  color: white;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
