<script setup>
defineProps({
  steps: {
    type: Array,
    default: () => ['Cadastro', 'Verificação'],
  },
  completed: {
    type: Number,
    default: 1,
  },
});
</script>

<template>
  <ol class="step-indicator" aria-label="Etapas do cadastro">
    <template v-for="(label, index) in steps" :key="label">
      <li class="step" :class="{ 'step--done': index < completed }">
        <span class="step-circle">
          <svg
            v-if="index < completed"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <span class="step-label">{{ label }}</span>
      </li>

      <li v-if="index < steps.length - 1" class="step-line" aria-hidden="true"></li>
    </template>
  </ol>
</template>

<style scoped>
.step-indicator {
  --azul: var(--primaria, #00265c);

  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--azul);
  border-radius: 50%;
  box-sizing: border-box;
  color: #fff;
  transition: background 0.3s ease;
}

.step--done .step-circle {
  background: var(--azul);
}

.step-label {
  color: var(--azul);
  font-size: 0.75rem;
  font-weight: 700;
}

.step-line {
  flex: 1;
  max-width: 140px;
  height: 1px;
  margin-top: 14px;
  background: var(--azul);
}
</style>