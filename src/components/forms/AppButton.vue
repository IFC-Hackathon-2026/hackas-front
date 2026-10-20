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
  <button :type="type" :disabled="disabled" class="app-button" :class="`app-button--${variant}`">
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.app-button--primary {
  background: #171717;
  color: #fff;
  border-color: #171717;
  transition: all .3s;
}

.app-button--primary:hover {
  background: rgb(41, 39, 39);
  border-color: rgb(41, 39, 39);
  transition: all .3s;
}

.app-button--secondary {
  background: inherit;
  color: #171717;
  border: 2px solid #171717;
  transition: all .3s;
}

.app-button--secondary:hover {
  background: #e2e1e1;
  transition: all .3s;
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
