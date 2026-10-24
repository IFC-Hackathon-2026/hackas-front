<script setup>
import { onUnmounted, ref, watch } from 'vue'
import { useDocumentoStore } from '@/stores/documentoStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import DocumentCard from '../documents/DocumentCard.vue'
import AppButton from '../forms/AppButton.vue'

const props = defineProps({
  projetoId: { type: [Number, String], required: true },
  tarefaId: { type: [Number, String], required: true },
})
const documentoStore = useDocumentoStore()
const documentos = ref([])
const carregando = ref(false)
const erro = ref('')
let versao = 0

async function carregarDocumentos() {
  const atual = ++versao
  documentos.value = []
  erro.value = ''
  carregando.value = true
  try {
    const resultado = await documentoStore.getDocumentosDaTarefa(props.projetoId, props.tarefaId)
    if (atual === versao) documentos.value = resultado
  } catch (error) {
    if (atual === versao) erro.value = apiErrorMessage(error, 'Não foi possível carregar os documentos da tarefa.')
  } finally {
    if (atual === versao) carregando.value = false
  }
}

watch(() => [props.projetoId, props.tarefaId], carregarDocumentos, { immediate: true })
onUnmounted(() => versao++)
</script>

<template>
  <section class="task-documents" aria-label="Documentos da tarefa">
    <h3>Documentos da tarefa</h3>
    <p v-if="carregando" role="status">Carregando documentos…</p>
    <div v-else-if="erro" class="error" role="alert">
      <p>{{ erro }}</p>
      <AppButton variant="secondary" @click="carregarDocumentos">Tentar novamente</AppButton>
    </div>
    <ul v-else-if="documentos.length" class="documents-list">
      <DocumentCard v-for="documento in documentos" :key="documento.id" :documento="documento" />
    </ul>
    <p v-else>Nenhum documento vinculado a esta tarefa.</p>
  </section>
</template>

<style scoped>
.task-documents {
  border-top: 1px solid #d9d9d9;
  padding-top: 1rem;
}
h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  list-style: none;
}
p {
  font-size: 0.85rem;
  color: #777;
}
.error p {
  color: #b91c1c;
  margin-bottom: 0.5rem;
}
</style>
