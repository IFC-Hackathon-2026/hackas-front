<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Abrir menu' },
  triggerTarget: { type: String, default: null },
})
const mobile = ref(false)
const panel = ref(null)
const trigger = ref(null)
let media
function close() {
  panel.value?.close()
}
function update() {
  close()
  mobile.value = media.matches
}
onMounted(() => {
  media = window.matchMedia('(max-width: 949px)')
  update()
  media.addEventListener('change', update)
})
onUnmounted(() => media?.removeEventListener('change', update))
</script>

<template>
  <template v-if="mobile">
    <Teleport :to="props.triggerTarget || 'body'" :disabled="!props.triggerTarget" defer>
    <button ref="trigger" type="button" class="menu-trigger" :aria-label="props.label" @click="panel.showModal()">
      <span class="mdi mdi-menu" aria-hidden="true"></span>
    </button>
    </Teleport>
    <Teleport to="body">
      <dialog ref="panel" class="mobile-sidebar" :aria-label="props.label" @click="($event.target === panel) && close()" @close="trigger?.focus()">
        <div class="panel-content">
          <button type="button" class="menu-close" aria-label="Fechar menu" autofocus @click="close">
            <span class="mdi mdi-close" aria-hidden="true"></span>
          </button>
          <slot :close="close" />
        </div>
      </dialog>
    </Teleport>
  </template>
  <slot v-else name="desktop" />
</template>

<style scoped>
.menu-trigger,
.menu-close {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: var(--primaria);
  font-size: 1.125rem;
  cursor: pointer;
}
.menu-trigger {
  border: 1px solid #d9e1ec;
  border-radius: 8px;
  background: #fff;
}
.mobile-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: min(260px, 82vw);
  height: 100dvh;
  max-height: 100dvh;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  border: 0;
  background: var(--fundo-claro);
  color: var(--texto);
  overflow-y: auto;
}
.mobile-sidebar::backdrop { background: rgb(0 18 40 / 50%); }
.panel-content {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: max(16px, env(safe-area-inset-top)) 14px max(16px, env(safe-area-inset-bottom));
}
.menu-close { display: grid; margin-left: auto; margin-bottom: 8px; }
button:focus-visible { outline: 2px solid var(--azul-claro); outline-offset: 2px; }
</style>
