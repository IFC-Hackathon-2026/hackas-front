<script setup>
import { computed, ref } from 'vue'
import { useStatusStore } from '@/stores/statusStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import AppInput from '../forms/AppInput.vue'
import AppButton from '../forms/AppButton.vue'
import TaskColorPicker from '../tasks/fields/TaskColorPicker.vue'

const props = defineProps({
  projetoId: { type: [String, Number], required: true },
  coluna: Object,
})
const emit = defineEmits(['salvo'])
const statusStore = useStatusStore()
const nome = ref(props.coluna?.nome ?? '')
const cor = ref(props.coluna?.cor ?? '#2767AA')
const salvando = ref(false)
const erro = ref('')
const editando = computed(() => Boolean(props.coluna?.id))
const temAlteracoes = computed(
  () => nome.value.trim() !== props.coluna?.nome || cor.value !== props.coluna?.cor,
)

async function salvarColuna() {
  if (salvando.value || statusStore.alterandoColuna) return
  if (editando.value && !temAlteracoes.value) return
  erro.value = ''
  if (!nome.value.trim() || nome.value.trim().length > 50) {
    erro.value = 'Informe um título de até 50 caracteres.'
    return
  }
  salvando.value = true
  try {
    const dados = { nome: nome.value.trim(), cor: cor.value }
    if (editando.value) {
      await statusStore.updateStatus(props.coluna.id, props.projetoId, dados)
    } else {
      await statusStore.createStatus(props.projetoId, dados)
    }
    emit('salvo', props.projetoId)
  } catch (error) {
    erro.value = apiErrorMessage(error, error.message || 'Não foi possível salvar a coluna.')
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <form class="column-form" @submit.prevent="salvarColuna">
    <fieldset :disabled="salvando">
      <AppInput v-model="nome" label="Título da coluna" placeholder="Ex.: Em revisão" required />
      <div class="color-field">
        <p>Cor da coluna</p>
        <TaskColorPicker v-model="cor" label="Cor da coluna" />
      </div>
      <p v-if="erro" class="error" role="alert">{{ erro }}</p>
      <AppButton type="submit" :disabled="editando && !temAlteracoes">
        {{ salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Criar coluna' }}
      </AppButton>
    </fieldset>
  </form>
</template>

<style scoped>
.column-form fieldset {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 0;
  padding: 0;
  min-width: 0;
}
.column-form :deep(.app-input) {
  margin-bottom: 0;
}
.color-field p {
  margin-bottom: 0.75rem;
}
.error {
  color: #b91c1c;
}
</style>
