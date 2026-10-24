
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
.app-button--primary {
  --button-background: var(--primaria, #01295f);
  --button-text: #fff;
  --button-hover-background: #fff;
  --button-hover-text: var(--primaria, #01295f);
}

.app-button--secondary {
  --button-background: #fff;
  --button-text: var(--primaria, #01295f);
  --button-hover-background: var(--primaria, #01295f);
  --button-hover-text: #fff;
}

.app-button--danger {
  --button-background: #fff;
  --button-text: #b91c1c;
  --button-hover-background: #b91c1c;
  --button-hover-text: #fff;
  --button-border: #b91c1c;
}

.app-button {
  position: relative;
  overflow: hidden;
  z-index: 0;
  width: 100%;
  height: 45px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--button-background) !important;
  color: var(--button-text) !important;
  font-size: 1.25rem;
  font-weight: 700;
  border: 2px solid var(--button-border, var(--primaria, #01295f)) !important;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.4s ease;
}

.app-button::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: var(--button-hover-background);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: -1;
}

.app-button:hover:not(:disabled),
.app-button:focus-visible:not(:disabled),
.app-button:active:not(:disabled) {
  color: var(--button-hover-text) !important;
}

.app-button:hover:not(:disabled)::before,
.app-button:focus-visible:not(:disabled)::before,
.app-button:active:not(:disabled)::before {
  transform: scaleX(1);
}

.app-button:focus-visible {
  outline: 2px solid var(--button-border, var(--primaria, #01295f));
  outline-offset: 2px;
}

.app-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

</style>
