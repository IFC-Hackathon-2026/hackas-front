<script setup>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useProjetoStore } from '@/stores/projetoStore'
import { PROJECT_CATEGORY_LABELS, PROJECT_CATEGORY_STYLES } from '@/constants/projectCategories'
import api from '@/api/config'
import { notificacao } from '@/services/notificacaoService'

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
    const projeto = await projetoStore.selecionarProjeto(props.eventoId)
    if (atual === consulta) evento.value = projeto
  } catch (error) {
    if (atual === consulta) {
      erro.value = error.response?.status === 404
        ? 'Evento não encontrado.'
        : 'Não foi possível carregar este evento.'
      notificacao.erro(erro.value)
    }
  } finally {
    if (atual === consulta) carregando.value = false
  }
}
watch(() => props.eventoId, carregar, { immediate: true })
onScopeDispose(() => { consulta++ })
</script>

<template>
  <section class="event-page" aria-labelledby="event-title">
    <RouterLink :to="{ name: 'eventos' }" class="back-link" aria-label="Voltar aos eventos"><span class="mdi mdi-arrow-left" aria-hidden="true"></span></RouterLink>
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
          <span v-for="categoria in evento.categorias" :key="categoria" class="category" :style="{ backgroundColor: PROJECT_CATEGORY_STYLES[categoria]?.background || '#2767aa' }">
            <span :class="['mdi', PROJECT_CATEGORY_STYLES[categoria]?.icon || 'mdi-tag-outline']" aria-hidden="true"></span>
            {{ PROJECT_CATEGORY_LABELS[categoria] || categoria }}
          </span>
        </div>
        <h1 id="event-title">{{ evento.nome }}</h1>
        <p class="description">{{ evento.descricao || 'Este evento ainda não tem uma descrição.' }}</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.event-page { width: 100%; margin-bottom: 96px; }
.back-link { display: inline-flex; color: var(--primaria); text-decoration: none; margin-bottom: 40px; }
.back-link .mdi { font-size: 28px; line-height: 1; }
.event-profile { display: grid; grid-template-columns: minmax(240px, 36%) minmax(0, 1fr); gap: clamp(32px, 6.5vw, 94px); align-items: start; }
.cover { width: 100%; height: 490px; object-fit: cover; border-radius: 6px; }
.cover-placeholder { background: #e9e9e9; }
.event-content { display: flex; flex-direction: column; align-items: flex-start; gap: 24px; min-width: 0; text-align: left; }
.event-content > * { margin: 0; }
.categories { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-start; }
.category { color: #fff; display: inline-flex; align-items: center; gap: 8px; padding: 5px 25px; border-radius: 24px; font-size: 16px; font-weight: 600; text-transform: uppercase; }
.category .mdi { font-size: 22px; }
h1 { margin: 0; color: var(--azul-escuro); font-size: clamp(22px, 2vw, 28px); font-weight: 600; }
.description { white-space: pre-line; overflow-wrap: anywhere; color: var(--texto); font-size: clamp(16px, 1.7vw, 23px); line-height: 1.35; }
button { margin-top: 16px; padding: 8px 16px; cursor: pointer; }
@media (max-width: 760px) {
  .event-page { margin-bottom: 48px; }
  .event-profile { grid-template-columns: 1fr; gap: 24px; }
  .cover { height: auto; aspect-ratio: 1 / 1; max-height: 450px; }
  .back-link { margin-bottom: 24px; }
  .event-content { gap: 20px; }
}
</style>
