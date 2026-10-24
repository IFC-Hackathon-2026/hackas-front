<script setup>
const model = defineModel({ type: String, required: true })
const priorities = [
  { value: 'baixa', label: 'Baixa', color: 'var(--verde)' },
  { value: 'media', label: 'Média', color: 'var(--amarelo)' },
  { value: 'alta', label: 'Alta', color: 'var(--laranja)' },
  { value: 'urgente', label: 'Urgente', color: '#B91C1C' },
]
</script>

<template>
  <fieldset class="field">
    <legend>Prioridade</legend>
    <div class="choices">
      <label v-for="priority in priorities" :key="priority.value" class="choice">
        <input type="radio" v-model="model" name="prioridade" :value="priority.value" />
        <span class="color-dot" :style="{ backgroundColor: priority.color }"></span
        >{{ priority.label }}
      </label>
    </div>
  </fieldset>
</template>

<style scoped></style>
<style scoped src="./choices.css"></style>
