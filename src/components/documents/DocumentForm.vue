<script setup>
import { onMounted, ref } from 'vue'
import { useDocumentoStore } from '@/stores/documentoStore'
import { useTarefaStore } from '@/stores/tarefaStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import AppInput from '../forms/AppInput.vue'
import AppButton from '../forms/AppButton.vue'

const props = defineProps({
  projetoId: { type: [Number, String], required: true },
})
const emit = defineEmits(['salvo'])
const enviando = defineModel('enviando', { type: Boolean, default: false })
const documentoStore = useDocumentoStore()
const tarefaStore = useTarefaStore()
const nome = ref('')
const tarefaId = ref('')
const tarefas = ref([])
const carregandoTarefas = ref(true)
const erroTarefas = ref('')
const origem = ref('link')
const link = ref('')
const arquivo = ref(null)
const chaveArquivo = ref('')
const erro = ref('')

async function carregarTarefas() {
  carregandoTarefas.value = true
  erroTarefas.value = ''
  try {
    tarefas.value = await tarefaStore.getTarefasParaSelecao(props.projetoId)
  } catch (error) {
    erroTarefas.value = apiErrorMessage(error, 'Não foi possível carregar as tarefas.')
  } finally {
    carregandoTarefas.value = false
  }
}

onMounted(carregarTarefas)

function trocarOrigem() {
  arquivo.value = null
  chaveArquivo.value = ''
  erro.value = ''
}

function selecionarArquivo(evento) {
  arquivo.value = evento.target.files?.[0] ?? null
  chaveArquivo.value = ''
  erro.value = ''
}

async function enviarDocumento() {
  if (enviando.value || carregandoTarefas.value || erroTarefas.value) return
  if (!tarefas.value.some((tarefa) => String(tarefa.id) === String(tarefaId.value))) {
    erro.value = 'Selecione uma tarefa deste projeto.'
    return
  }
  if (!nome.value.trim() || nome.value.trim().length > 200) {
    erro.value = 'Informe um título de até 200 caracteres.'
    return
  }
  enviando.value = true
  erro.value = ''
  try {
    const dados = {
      nome: nome.value,
      tarefa: tarefaId.value,
    }
    if (origem.value === 'link') {
      dados.url = link.value
    } else {
      if (!chaveArquivo.value) {
        const upload = await documentoStore.uploadDocumento(arquivo.value)
        chaveArquivo.value = upload.attachment_key
      }
      dados.arquivo_attachment_key = chaveArquivo.value
    }
    const documento = await documentoStore.createDocumento(dados)
    emit('salvo', documento)
  } catch (error) {
    erro.value = apiErrorMessage(error, error.message || 'Não foi possível enviar o documento.')
  } finally {
    enviando.value = false
  }
}

</script>

<template>
  <form class="document-form" @submit.prevent="enviarDocumento">
    <p v-if="carregandoTarefas" role="status">Carregando tarefas…</p>
    <div v-else-if="erroTarefas" class="error" role="alert">
      <p>{{ erroTarefas }}</p>
      <AppButton variant="secondary" @click="carregarTarefas">Tentar novamente</AppButton>
    </div>
    <p v-else-if="!tarefas.length">Crie uma tarefa neste projeto para vincular o documento.</p>
    <fieldset :disabled="enviando || carregandoTarefas || Boolean(erroTarefas) || !tarefas.length">
      <label class="field">
        <span>Título do documento</span>
        <AppInput v-model="nome" type="text" placeholder="Ex.: Requisitos do projeto" required />
      </label>
      <label class="field">
        Tarefa (obrigatória)
        <select v-model="tarefaId" required>
          <option value="" disabled>Selecione uma tarefa</option>
          <option v-for="tarefa in tarefas" :key="tarefa.id" :value="tarefa.id">
            {{ tarefa.titulo }}
          </option>
        </select>
      </label>
      <fieldset class="source-field">
        <legend>Como deseja adicionar o documento?</legend>
        <div class="source-options">
          <label class="source-option">
            <input v-model="origem" type="radio" value="link" name="origem-documento" @change="trocarOrigem" />
            <span class="mdi mdi-link-variant" aria-hidden="true" /> Link externo
          </label>
          <label class="source-option">
            <input v-model="origem" type="radio" value="arquivo" name="origem-documento" @change="trocarOrigem" />
            <span class="mdi mdi-upload" aria-hidden="true" /> Arquivo do computador
          </label>
        </div>
      </fieldset>
      <label v-if="origem === 'link'" class="field">
        <span>URL do documento</span>
        <AppInput v-model="link" type="url" placeholder="https://exemplo.com/documento" required />
      </label>
      <label v-else class="field">
        Arquivo PDF
        <input type="file" accept=".pdf,application/pdf" required @change="selecionarArquivo" />
      </label>
      <p v-if="erro" class="error" role="alert">{{ erro }}</p>
      <AppButton type="submit" :disabled="!nome.trim() || !tarefaId || enviando || (origem === 'link' ? !link.trim() : !arquivo)">
        {{ enviando ? 'Salvando…' : 'Adicionar documento' }}
      </AppButton>
    </fieldset>
  </form>
</template>

<style scoped>
fieldset {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  border: 0;
  padding: 0;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.document-form :deep(.app-input) {
  margin-bottom: 0;
}
select, input[type='file'] {
  width: 100%;
  min-width: 0;
  padding: 0.65rem;
  border: 1px solid #9a9a9a;
  border-radius: 6px;
  background: transparent;
  color: inherit;
}
.source-field legend {
  margin-bottom: 0.5rem;
}
.source-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.source-option {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
}
.source-option:has(input:checked) {
  border-color: var(--primaria);
  background: #eaf0f8;
  color: var(--primaria);
}
.source-option input {
  accent-color: var(--primaria);
}
.error {
  color: #b91c1c;
}
.document-form > p, .document-form > .error {
  margin-bottom: 1rem;
}
</style>
