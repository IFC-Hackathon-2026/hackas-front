<script setup>
import { computed, onMounted, ref } from 'vue'
import { useTarefaStore } from '@/stores/tarefaStore'
import { useCategoriaStore } from '@/stores/categoriaStore'
import { useUserStore } from '@/stores/userStore'
import { useProjetoStore } from '@/stores/projetoStore'
import AppInput from '../forms/AppInput.vue'
import AppButton from '../forms/AppButton.vue'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import TaskCategoryField from './fields/TaskCategoryField.vue'
import TaskAssigneeField from './fields/TaskAssigneeField.vue'
import TaskDateFields from './fields/TaskDateFields.vue'
import TaskPriorityField from './fields/TaskPriorityField.vue'

const emit = defineEmits(['saved'])
const tarefaStore = useTarefaStore()
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
  } finally {
    loadingOptions.value = false
  }
}
onMounted(loadOptions)
async function addTarefa() {
  if (loading.value || carregandoCategoria.value) return
  errorMsg.value = ''
  if (!tarefaStore.tarefa.titulo.trim() || tarefaStore.tarefa.titulo.trim().length > 150) {
    errorMsg.value = 'Informe um título de até 150 caracteres.'
    return
  }
  if (categoriaPendente.value) {
    errorMsg.value = 'Adicione a nova categoria antes de salvar a tarefa.'
    return
  }
  loading.value = true
  try {
    const payload = {
      ...tarefaStore.tarefa,
      titulo: tarefaStore.tarefa.titulo.trim(),
      categoria: [...tarefaStore.tarefa.categoria],
      responsavel: [...tarefaStore.tarefa.responsavel],
      prazo: tarefaStore.tarefa.prazo || null,
    }
    const saved = await tarefaStore.createTarefa(payload.projeto, payload)
    emit('saved', saved)
  } catch (error) {
    errorMsg.value = apiErrorMessage(error, 'Não foi possível adicionar. Tente novamente.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="task-form" @submit.prevent="addTarefa">
    <p v-if="loadingOptions" role="status">Carregando opções…</p>
    <div v-if="optionsError" role="alert">
      <p>{{ optionsError }}</p>
      <button type="button" @click="loadOptions">Tentar novamente</button>
    </div>
    <fieldset :disabled="loading || loadingOptions || carregandoCategoria">
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
      <TaskDateFields v-model="tarefaStore.tarefa.prazo" />
      <TaskPriorityField v-model="tarefaStore.tarefa.prioridade" />
      <p v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</p>
      <AppButton type="submit" :disabled="Boolean(optionsError)">{{
        loading ? 'Salvando…' : 'Adicionar tarefa'
      }}</AppButton>
    </fieldset>
  </form>
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
</style>
