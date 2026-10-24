<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStatusStore } from '@/stores/statusStore'
import { useTarefaStore } from '@/stores/tarefaStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useUserStore } from '@/stores/userStore'
import { useProjetoStore } from '@/stores/projetoStore'
import AppInput from '../forms/AppInput.vue'
import AppButton from '../forms/AppButton.vue'
import AppConfirmModal from '../modais/AppConfirmModal.vue'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import { notificacao } from '@/services/notificacaoService'
import TaskCategoryField from './fields/TaskCategoryField.vue'
import TaskAssigneeField from './fields/TaskAssigneeField.vue'
import TaskDateFields from './fields/TaskDateFields.vue'
import TaskPriorityField from './fields/TaskPriorityField.vue'
import TaskDocuments from './TaskDocuments.vue'
import TaskComments from './TaskComments.vue'

const emit = defineEmits(['saved', 'deleted'])
const tarefaStore = useTarefaStore()
const statusStore = useStatusStore()
const editing = computed(() => Boolean(tarefaStore.tarefa.id))
const deleting = ref(false)
const confirmingDelete = ref(false)
const erroExclusao = ref('')
const originalDeadline = tarefaStore.tarefa.prazo
const deadlineDate = (value) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}
const deadline = ref(deadlineDate(originalDeadline))

function dadosEditaveis() {
  return JSON.stringify({
    titulo: tarefaStore.tarefa.titulo.trim(),
    descricao: tarefaStore.tarefa.descricao ?? '',
    prioridade: tarefaStore.tarefa.prioridade,
    status: tarefaStore.tarefa.status,
    prazo: deadline.value,
    categoria: [...tarefaStore.tarefa.categoria].sort((a, b) => a - b),
    responsavel: [...tarefaStore.tarefa.responsavel].sort((a, b) => a - b),
  })
}

const dadosOriginais = ref(dadosEditaveis())
const temAlteracoes = computed(() => dadosEditaveis() !== dadosOriginais.value)
const categoriaStore = useCategoriaStore()
const userStore = useUserStore()
const projetoStore = useProjetoStore()
const loading = ref(false)
const loadingOptions = ref(true)
const optionsError = ref('')
const errorMsg = ref('')
const carregandoCategoria = ref(false)
const categoriaPendente = ref(false)
const responsaveis = computed(() => {
  const ids = new Set(projetoStore.participantes.map((user) => user.id))
  return userStore.users.filter((user) => ids.has(user.id))
})
async function loadOptions() {
  loadingOptions.value = true
  optionsError.value = ''
  try {
    await Promise.all([
      categoriaStore.getCategorias(tarefaStore.tarefa.projeto),
      userStore.getAllUsers(),
    ])
  } catch {
    optionsError.value = 'Não foi possível carregar categorias e responsáveis.'
    notificacao.erro(optionsError.value)
  } finally {
    loadingOptions.value = false
  }
}
onMounted(loadOptions)
async function saveTarefa() {
  if (
    loading.value ||
    deleting.value ||
    loadingOptions.value ||
    optionsError.value ||
    carregandoCategoria.value
  )
    return
  if (editing.value && !temAlteracoes.value) return
  errorMsg.value = ''
  if (!tarefaStore.tarefa.titulo.trim() || tarefaStore.tarefa.titulo.trim().length > 150) {
    errorMsg.value = 'Informe um título de até 150 caracteres.'
    notificacao.aviso(errorMsg.value)
    return
  }
  if (categoriaPendente.value) {
    errorMsg.value = 'Adicione a nova categoria antes de salvar a tarefa.'
    notificacao.aviso(errorMsg.value)
    return
  }
  loading.value = true
  try {
    const payload = {
      ...tarefaStore.tarefa,
      titulo: tarefaStore.tarefa.titulo.trim(),
      categoria: [...tarefaStore.tarefa.categoria],
      responsavel: [...tarefaStore.tarefa.responsavel],
      prazo:
        deadline.value === deadlineDate(originalDeadline)
          ? originalDeadline
          : deadline.value || null,
    }
    const saved = editing.value
      ? await tarefaStore.updateTarefa(payload.id, payload.projeto, payload)
      : await tarefaStore.createTarefa(payload.projeto, payload)
    dadosOriginais.value = dadosEditaveis()
    emit('saved', saved)
  } catch (error) {
    errorMsg.value = apiErrorMessage(error, 'Não foi possível salvar. Tente novamente.')
    notificacao.erro(errorMsg.value)
  } finally {
    loading.value = false
  }
}
function confirmarExclusao() {
  erroExclusao.value = ''
  confirmingDelete.value = true
}

async function deleteTarefa() {
  if (loading.value || deleting.value || !editing.value || !confirmingDelete.value) return
  deleting.value = true
  erroExclusao.value = ''
  try {
    await tarefaStore.deleteTarefa(tarefaStore.tarefa.id, tarefaStore.tarefa.projeto)
    confirmingDelete.value = false
    emit('deleted')
  } catch (error) {
    erroExclusao.value = apiErrorMessage(error, 'Não foi possível excluir. Tente novamente.')
    notificacao.erro(erroExclusao.value)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <form class="task-form" @submit.prevent="saveTarefa">
    <p v-if="loadingOptions" role="status">Carregando opções…</p>
    <div v-if="optionsError" role="alert">
      <p>{{ optionsError }}</p>
      <button type="button" @click="loadOptions">Tentar novamente</button>
    </div>
    <fieldset :disabled="loading || deleting || loadingOptions || carregandoCategoria">
      <AppInput
        label="Título"
        placeholder="Digite o título da tarefa"
        v-model="tarefaStore.tarefa.titulo"
        required
      />
      <label class="field"
        >Descrição<textarea
          v-model="tarefaStore.tarefa.descricao"
          rows="4"
          placeholder="Descreva a tarefa"
        ></textarea>
      </label>
      <TaskCategoryField
        v-model="tarefaStore.tarefa.categoria"
        v-model:carregando="carregandoCategoria"
        v-model:pendente="categoriaPendente"
        :projeto-id="tarefaStore.tarefa.projeto"
      />
      <TaskAssigneeField
        v-model="tarefaStore.tarefa.responsavel"
        :users="responsaveis"
        :loading="loadingOptions"
      />
      <TaskDateFields v-model="deadline" />
      <label v-if="editing" class="field"
        >Status
        <select v-model="tarefaStore.tarefa.status">
          <option
            v-for="status in statusStore.statusesOrdenados"
            :key="status.id"
            :value="status.id"
          >
            {{ status.nome }}
          </option>
        </select>
      </label>
      <TaskPriorityField v-model="tarefaStore.tarefa.prioridade" />
      <TaskDocuments
        v-if="editing"
        :tarefa-id="tarefaStore.tarefa.id"
        :projeto-id="tarefaStore.tarefa.projeto"
      />
      <p v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</p>
      <AppButton type="submit" :disabled="Boolean(optionsError) || (editing && !temAlteracoes)">{{
        loading ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar tarefa'
      }}</AppButton>
      <AppButton v-if="editing" type="button" variant="danger" @click="confirmarExclusao">
        Excluir tarefa
      </AppButton>
    </fieldset>
  </form>
  <TaskComments
    v-if="editing"
    :tarefa-id="tarefaStore.tarefa.id"
    :desabilitado="loading || deleting"
  />
  <AppConfirmModal
    v-model:visible="confirmingDelete"
    titulo="Excluir tarefa"
    :mensagem="'Tem certeza de que deseja excluir a tarefa “' + tarefaStore.tarefa.titulo + '”?'"
    :carregando="deleting"
    :erro="erroExclusao"
    @confirmar="deleteTarefa"
  >
    <p>Esta ação não pode ser desfeita.</p>
  </AppConfirmModal>
</template>

<style scoped>
.task-form > fieldset {
  border: 0;
  padding: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.task-form :deep(.app-input) {
  margin-bottom: 0;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
select,
textarea {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #9a9a9a;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  resize: vertical;
}
.error {
  color: #b91c1c;
}

@media (max-width: 600px) {
  .task-form > fieldset { gap: 1rem; }
  select,
  textarea,
  .task-form :deep(.input-class) { min-height: 44px; font-size: 16px; }
  textarea { min-height: 96px; }
  .task-form :deep(.app-button) { min-height: 44px; font-size: 0.9375rem; }
}
</style>
