<script setup>
const model = defineModel({ type: String, required: true })
const colors = [
  '#2767AA',
  '#429E5E',
  '#FFBE33',
  '#E53D00',
  '#8B5CF6',
  '#EC4899',
  '#808080',
  '#01295F',
]
</script>

<template>
  <div class="color-picker">
    <div class="choices" role="group" aria-label="Cor da categoria">
      <button
        v-for="color in colors"
        :key="color"
        type="button"
        class="color-button"
        :style="{ backgroundColor: color }"
        :aria-label="'Cor ' + color"
        :aria-pressed="model === color"
        @click="model = color"
      >
        <span v-if="model === color" aria-hidden="true">✓</span>
      </button>
    </div>
    <label class="custom-color">Outra cor <input v-model="model" type="color" /></label>
  </div>
</template>

<style scoped>
.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.color-button {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.color-button[aria-pressed='true'] {
  outline: 2px solid var(--primaria);
  outline-offset: 2px;
}
.color-button span {
  color: white;
  text-shadow: 0 1px 3px black;
}
.custom-color {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.75rem;
}
</style>
