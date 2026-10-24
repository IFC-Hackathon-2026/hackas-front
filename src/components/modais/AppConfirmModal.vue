<script setup>
import AppModal from './AppModal.vue'
import AppButton from '../forms/AppButton.vue'

const props = defineProps({
  titulo: { type: String, required: true },
  mensagem: { type: String, required: true },
  carregando: Boolean,
  desabilitado: Boolean,
  erro: String,
})
const visible = defineModel('visible', { type: Boolean, default: false })
const emit = defineEmits(['confirmar'])

function confirmar() {
  if (!props.carregando && !props.desabilitado) emit('confirmar')
}
</script>

<template>
  <AppModal v-model:visible="visible" :title="props.titulo" :bloqueado="props.carregando">
    <div class="confirmation-content">
      <p>{{ props.mensagem }}</p>
      <slot />
      <p v-if="props.erro" class="error" role="alert">{{ props.erro }}</p>
      <div class="confirmation-actions">
        <AppButton
          variant="secondary"
          autofocus
          :disabled="props.carregando"
          @click="visible = false"
          >Cancelar</AppButton
        >
        <AppButton
          variant="danger"
          :disabled="props.carregando || props.desabilitado"
          @click="confirmar"
        >
          {{ props.carregando ? 'Excluindo…' : 'Excluir' }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.confirmation-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.confirmation-actions {
  display: flex;
  gap: 0.75rem;
}
.confirmation-actions :deep(.app-button) {
  flex: 1;
  min-width: 0;
  font-size: 1rem;
}
.error {
  color: #b91c1c;
}

@media (max-width: 420px) {
  .confirmation-actions { flex-direction: column-reverse; }
  .confirmation-actions :deep(.app-button) { width: 100%; min-height: 44px; }
}
</style>
