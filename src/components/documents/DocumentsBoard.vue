<script setup>
import { ref, watch } from 'vue'
import { useDocumentoStore } from '@/stores/documentoStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import AppButton from '../forms/AppButton.vue'
import AppModal from '../modais/AppModal.vue'
import DocumentCard from './DocumentCard.vue'
import DocumentForm from './DocumentForm.vue'

const props = defineProps({ projetoId: [Number, String] })
const documentoStore = useDocumentoStore()
const mostrarModal = ref(false)
const enviando = ref(false)
const carregando = ref(false)
const erro = ref('')
const mensagem = ref('')
let versao = 0

async function carregarDocumentos() {
  const atual = ++versao
  carregando.value = Boolean(props.projetoId)
  erro.value = ''
  if (!props.projetoId) {
    documentoStore.reset()
    return
  }
  try {
    await documentoStore.getDocumentos(props.projetoId, { page_size: 100 }, true)
  } catch (error) {
    if (atual === versao) erro.value = apiErrorMessage(error, 'Não foi possível carregar os documentos.')
  } finally {
    if (atual === versao) carregando.value = false
  }
}

async function documentoSalvo(documento) {
  const projetoId = documento.projeto?.id ?? documento.projeto ?? documento.tarefa_origem?.projeto
  if (String(projetoId) !== String(props.projetoId)) return
  mostrarModal.value = false
  mensagem.value = 'Documento adicionado com sucesso.'
  await carregarDocumentos()
}

watch(() => props.projetoId, () => {
  mostrarModal.value = false
  mensagem.value = ''
  carregarDocumentos()
}, { immediate: true })
</script>

<template>
  <section class="documents-board">
    <header class="documents-header">
      <div>
        <h2>Documentos</h2>
        <p>Organize links e arquivos PDF do projeto.</p>
      </div>
      <AppButton class="upload-button" :disabled="!props.projetoId || carregando || enviando" @click="mostrarModal = true">
        <span class="mdi mdi-plus" aria-hidden="true" /> Adicionar documento
      </AppButton>
    </header>
    <p v-if="mensagem" role="status">{{ mensagem }}</p>
    <p v-if="!props.projetoId">Selecione um projeto para ver os documentos.</p>
    <p v-else-if="carregando" role="status">Carregando documentos…</p>
    <div v-else-if="erro" class="error" role="alert">
      <p>{{ erro }}</p>
      <AppButton variant="secondary" class="retry-button" @click="carregarDocumentos">Tentar novamente</AppButton>
    </div>
    <ul v-else-if="documentoStore.documentos.length" class="documents-list" aria-label="Documentos do projeto">
      <DocumentCard v-for="documento in documentoStore.documentos" :key="documento.id" :documento="documento" />
    </ul>
    <p v-else>Nenhum documento neste projeto. Adicione um link ou envie um PDF.</p>
    <AppModal v-model:visible="mostrarModal" title="Adicionar documento" :bloqueado="enviando">
      <DocumentForm
        v-if="mostrarModal && props.projetoId"
        :key="props.projetoId"
        v-model:enviando="enviando"
        :projeto-id="props.projetoId"
        @salvo="documentoSalvo"
      />
    </AppModal>
  </section>
</template>

<style scoped>
.documents-board {
  padding-block: 2rem;
}
.documents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.documents-header p {
  margin-top: 0.4rem;
  color: #777;
}
.upload-button, .retry-button {
  width: auto;
  padding-inline: 1rem;
  font-size: 1rem;
}
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  list-style: none;
}
.documents-board > p[role='status'] {
  margin-bottom: 1rem;
}
.error {
  color: #b91c1c;
}
.error p {
  margin-bottom: 0.75rem;
}

@media (max-width: 600px) {
  .documents-board { padding-block: 1.5rem; }
  .documents-header { align-items: stretch; gap: 0.75rem; }
  .documents-header > div { width: 100%; }
  .documents-header h2 { font-size: 1.25rem; }
  .documents-header p { font-size: 0.875rem; }
  .upload-button, .retry-button { width: 100%; min-height: 44px; }
}
</style>
