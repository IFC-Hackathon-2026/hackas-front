<script setup>
import { prioridades } from '@/constants/prioridades'

const model = defineModel({ type: String, required: true })
</script>

<template>
  <fieldset class="field">
    <legend>Prioridade</legend>
    <div class="choices">
      <label v-for="(prioridade, valor) in prioridades" :key="valor" class="choice">
        <input type="radio" v-model="model" name="prioridade" :value="valor" />
        <span class="color-dot" :style="{ backgroundColor: prioridade.cor }"></span
        >{{ prioridade.nome }}
      </label>
    </div>
  </fieldset>
</template>

<style scoped></style>
<style scoped src="./choices.css"></style>
