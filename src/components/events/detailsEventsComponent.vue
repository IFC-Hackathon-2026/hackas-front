<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useProjetoStore } from '@/stores/projetoStore'
import { PROJECT_CATEGORY_LABELS, PROJECT_CATEGORY_STYLES } from '@/constants/projectCategories'
import api from '@/api/config'

const props = defineProps({
  eventoId: { type: [String, Number], required: true },
})
const projetoStore = useProjetoStore()
const evento = ref(null)
const carregando = ref(false)
const erro = ref('')
const imagemFalhou = ref(false)
let consulta = 0
const imagem = computed(() => {
  const url = evento.value?.foto?.url
  return url ? new URL(url, new URL(api.defaults.baseURL, window.location.origin)).href : ''
})

async function carregar() {
  const atual = ++consulta
  carregando.value = true
  erro.value = ''
  evento.value = null
  imagemFalhou.value = false
  try {
    const projeto = await projetoStore.getProjeto(props.eventoId)
    if (atual === consulta) evento.value = projeto
  } catch (error) {
    if (atual === consulta) erro.value = error.response?.status === 404
      ? 'Evento não encontrado.'
      : 'Não foi possível carregar este evento.'
  } finally {
    if (atual === consulta) carregando.value = false
  }
}
watch(() => props.eventoId, carregar, { immediate: true })
onScopeDispose(() => { consulta++ })
</script>

<template>
  <section class="event-page" aria-labelledby="event-title">
    <RouterLink :to="{ name: 'eventos' }" class="back-link"><span class="mdi mdi-arrow-left" aria-hidden="true"></span> Voltar aos eventos</RouterLink>
    <h1 v-if="!evento" id="event-title">Detalhes do evento</h1>
    <p v-if="carregando" role="status">Carregando evento...</p>
    <div v-else-if="erro" role="alert">
      <p>{{ erro }}</p>
      <button type="button" @click="carregar">Tentar novamente</button>
    </div>
    <article v-else-if="evento" class="event-profile">
      <img v-if="imagem && !imagemFalhou" :src="imagem" :alt="`Imagem de ${evento.nome}`" class="cover" @error="imagemFalhou = true" />
      <div v-else class="cover cover-placeholder" aria-hidden="true"></div>
      <div class="event-content">
        <div class="categories" aria-label="Categorias do evento">
          <span v-for="categoria in evento.categorias" :key="categoria" class="category" :style="{ color: PROJECT_CATEGORY_STYLES[categoria]?.color, backgroundColor: PROJECT_CATEGORY_STYLES[categoria]?.background }">
            <span :class="['mdi', PROJECT_CATEGORY_STYLES[categoria]?.icon || 'mdi-tag-outline']" aria-hidden="true"></span>
            {{ PROJECT_CATEGORY_LABELS[categoria] || categoria }}
          </span>
        </div>
        <h1 id="event-title">{{ evento.nome }}</h1>
        <p v-if="evento.criador?.name" class="creator">Organizado por {{ evento.criador.name }}</p>
        <h2>Sobre o evento</h2>
        <p class="description">{{ evento.descricao || 'Este evento ainda não tem uma descrição.' }}</p>
        <p v-if="evento.total_participantes != null" class="participants"><span class="mdi mdi-account-group-outline" aria-hidden="true"></span> {{ evento.total_participantes }} participante(s)</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.event-page {
  width: 100%;
  max-width: 1040px;
  margin: 32px auto 64px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  color: var(--primaria);
  text-decoration: none;
}
.event-profile {
  overflow: hidden;
  border: 1px solid #e1e5eb;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 18px rgb(0 18 40 / 6%);
}
.cover {
  width: 100%;
  height: clamp(180px, 30vw, 340px);
  object-fit: cover;
}
.cover-placeholder {
  background: #e9e9e9;
}
.event-content {
  padding: clamp(20px, 4vw, 40px);
}
.categories {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #e7f0fb;
  color: var(--primaria);
  font-size: 13px;
  font-weight: 600;
}
h1 {
  margin-bottom: 12px;
  color: var(--primaria);
  font-size: clamp(24px, 4vw, 36px);
}
h2 {
  margin: 28px 0 12px;
  font-size: 19px;
}
.creator {
  color: #5f6875;
  font-size: 14px;
}
.description {
  white-space: pre-line;
  overflow-wrap: anywhere;
  color: #4c5665;
}
.participants {
  margin-top: 28px;
  color: var(--primaria);
}
button {
  margin-top: 16px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
