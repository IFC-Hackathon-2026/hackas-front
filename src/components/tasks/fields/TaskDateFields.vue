<script setup>
const model = defineModel({ type: String })
</script>

<template>
  <div>
    <label class="field">Data de entrega<input v-model="model" type="date" /></label>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
input {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #9a9a9a;
  border-radius: 6px;
  background: transparent;
  color: inherit;
}
</style>
