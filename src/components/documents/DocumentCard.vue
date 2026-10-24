<script setup>
import { computed } from 'vue'
import api from '@/api/config'

const props = defineProps({
  documento: { type: Object, required: true },
})

const url = computed(() => {
  const link = props.documento.arquivo?.url || props.documento.url
  if (!link) return ''
  try {
    const base = new URL(api.defaults.baseURL, globalThis.location?.origin)
    const endereco = new URL(link, base)
    return ['http:', 'https:'].includes(endereco.protocol) ? endereco.href : ''
  } catch {
    return ''
  }
})
</script>

<template>
  <li class="document-card">
    <span
      class="mdi document-icon"
      :class="props.documento.arquivo ? 'mdi-file-pdf-box' : 'mdi-link-variant'"
      aria-hidden="true"
    />
    <div class="document-info">
      <h3>{{ props.documento.nome }}</h3>
      <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer">
        {{ url }}
        <span class="mdi mdi-open-in-new" aria-hidden="true" />
      </a>
      <p v-else>Arquivo indisponível.</p>
    </div>
  </li>
</template>

<style scoped>
.document-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  background: #fff;
  transition: box-shadow 0.2s ease;
}
.document-card:hover {
  box-shadow: 0 4px 16px rgb(0 18 40 / 10%);
}
.document-icon {
  flex-shrink: 0;
  font-size: 2rem;
  color: #b91c1c;
}
.document-info {
  min-width: 0;
}
h3 {
  margin-bottom: 0.3rem;
  font-size: 1rem;
  font-weight: 600;
}
a, p {
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}
a {
  color: var(--primaria);
}
a:focus-visible {
  outline: 2px solid var(--primaria);
  outline-offset: 3px;
}
p {
  color: #777;
}
</style>
