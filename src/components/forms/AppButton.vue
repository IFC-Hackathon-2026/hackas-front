
<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="app-button"
    :class="`app-button--${variant}`"
  >
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  position: relative;
  overflow: hidden;
  z-index: 0;
  width: 100%;
  height: 50px;
  background: transparent !important;
  color: var(--primaria, #00265c) !important;
  font-size: 1.25rem;
  font-weight: 700;
  border: 2px solid var(--primaria, #00265c) !important;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.4s ease;
}

.app-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--primaria, #00265c);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: -1;
}

.app-button:hover:not(:disabled),
.app-button:focus-visible:not(:disabled),
.app-button:active:not(:disabled) {
  color: #fff !important;
  border-color: var(--primaria, #00265c) !important;
}

.app-button:hover:not(:disabled)::before,
.app-button:focus-visible:not(:disabled)::before,
.app-button:active:not(:disabled)::before {
  transform: scaleX(1);
}

.app-button:focus-visible {
  outline: 2px solid var(--primaria, #00265c);
  outline-offset: 2px;
}

.app-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.app-button--secondary {
  background: #f6f6f2 !important;
  color: #01295f !important;
  border-color: #01295f !important;
}

.app-button--secondary::before {
  background: #01295f;
}

.app-button--secondary:hover:not(:disabled),
.app-button--secondary:focus-visible:not(:disabled),
.app-button--secondary:active:not(:disabled) {
  color: #ffffff !important;
  border-color: #01295f !important;
}

</style>
