<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});

const visible = defineModel('visible', { type: Boolean, default: false });
const dialog = ref(null);

function syncVisibility() {
  if (!dialog.value) return;

  if (visible.value && !dialog.value.open) {
    dialog.value.showModal();
  } else if (!visible.value && dialog.value.open) {
    dialog.value.close();
  }
}

onMounted(syncVisibility);
watch(visible, syncVisibility);
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="app-modal"
      @cancel.prevent="visible = false"
      @close="visible = false"
    >
      <header class="modal-header">
        <h2>{{ props.title }}</h2>
        <button type="button" class="close-button" aria-label="Fechar modal" @click="visible = false">
          <span class="mdi mdi-close" aria-hidden="true"></span>
        </button>
      </header>

      <div class="modal-content">
        <slot />
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
.app-modal {
  width: min(32rem, calc(100vw - 2rem));
  max-height: min(600px, calc(100dvh - 2rem));
  margin: auto;
  padding: 1.5rem;
  border: 0;
  border-radius: 12px;
  background: var(--fundo-claro, #fff);
  color: var(--azul-escuro, #001228);
  box-shadow: 0 12px 40px rgb(0 0 0 / 20%);
  overflow: hidden;
}

.app-modal[open] {
  display: flex;
  flex-direction: column;
}

.modal-content {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.app-modal::backdrop {
  background: rgb(0 0 0 / 45%);
}

.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
}

.close-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-button:hover {
  background: rgb(0 0 0 / 8%);
}
</style>
