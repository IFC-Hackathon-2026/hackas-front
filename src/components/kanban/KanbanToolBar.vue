<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AppInput from '../forms/AppInput.vue'
import AppButton from '../forms/AppButton.vue';
import { prioridades } from '@/constants/prioridades'

const props = defineProps({
  categorias: Array,
  usuarios: Array,
  desabilitado: Boolean,
})

const filtros = defineModel({ type: Object, required: true })
const mostrarFiltros = ref(false)
const toolbar = ref(null)
const botaoFiltro = ref(null)

const emit = defineEmits(['limpar'])

function fecharFiltros() {
  mostrarFiltros.value = false
  botaoFiltro.value.focus()
}

function clicarFora(evento) {
  if (!toolbar.value.contains(evento.target)) mostrarFiltros.value = false
}

function pressionarTecla(evento) {
  if (evento.key === 'Escape' && mostrarFiltros.value) fecharFiltros()
}

onMounted(() => {
  document.addEventListener('pointerdown', clicarFora)
  document.addEventListener('keydown', pressionarTecla)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', clicarFora)
  document.removeEventListener('keydown', pressionarTecla)
})
</script>

<template>
  <fieldset ref="toolbar" class="kanban-toolbar" :disabled="props.desabilitado">
    <div class="search-area">
      <AppInput
        v-model="filtros.search"
        class="search-input"
        label="Pesquisar tarefas"
        type="search"
        placeholder="Buscar..."
        icon="mdi-magnify"
      />
      <button
        ref="botaoFiltro"
        type="button"
        class="filter-button"
        aria-label="Filtros de tarefas"
        :aria-expanded="mostrarFiltros"
        @click="mostrarFiltros = !mostrarFiltros"
      >
        <span class="mdi mdi-filter-variant" aria-hidden="true" />
      </button>
    </div>

    <div v-if="mostrarFiltros" class="filters-area" role="region" aria-label="Filtros de tarefas">
      <div class="filters-header">
        <h3>Filtros</h3>
        <button
          type="button"
          class="close-button"
          aria-label="Fechar filtros"
          @click="fecharFiltros"
        >
          <span class="mdi mdi-close" aria-hidden="true" />
        </button>
      </div>
      <fieldset class="multiple-filter">
        <legend>Categorias</legend>
        <div class="filter-options">
          <label v-for="categoria in props.categorias" :key="categoria.id">
            <input v-model="filtros.categoria" type="checkbox" :value="categoria.id" />
            <span class="color-dot" :style="{ backgroundColor: categoria.cor }" />
            {{ categoria.nome }}
          </label>
        </div>
        <small>Sem seleção: todas</small>
      </fieldset>
      <fieldset class="multiple-filter">
        <legend>Usuários</legend>
        <div class="filter-options">
          <label v-for="usuario in props.usuarios" :key="usuario.id">
            <input v-model="filtros.responsavel" type="checkbox" :value="usuario.id" />
            <img v-if="usuario.foto?.url" :src="usuario.foto.url" alt="" class="user-avatar" />
            <span v-else class="mdi mdi-account-circle user-avatar-default" aria-hidden="true" />
            <span>{{ usuario.name || usuario.email || 'Usuário ' + usuario.id }}</span>
          </label>
        </div>
        <small>Sem seleção: todos</small>
      </fieldset>
      <label
        >Prioridade
        <select v-model="filtros.prioridade">
          <option value="">Todas</option>
          <option v-for="(prioridade, valor) in prioridades" :key="valor" :value="valor">
            {{ prioridade.nome }}
          </option>
        </select>
      </label>
      <fieldset class="multiple-filter">
        <legend>Atrasadas</legend>
        <label class="overdue-filter">
          <input v-model="filtros.atrasadas" type="checkbox" /> Apenas tarefas atrasadas
        </label>
      </fieldset>
      <label
        >Data de entrega
        <input v-model="filtros.prazo" type="date" />
      </label>
      <AppButton @click="emit('limpar')" variant="secondary">Limpar filtros</AppButton>
    </div>
  </fieldset>
</template>

<style scoped>
.kanban-toolbar {
  position: relative;
  border: 0;
  padding: 0;
  min-width: 0;
  margin-bottom: 1rem;
  flex-shrink: 0;
}
.search-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.search-input {
  flex: 1;
  min-width: 0;
  margin-bottom: 0;
}
.search-input :deep(.label-class) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.search-input :deep(.input-class) {
  height: 50px;
  border: 1px solid #5b7399;
  background: white;
}
.filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 0;
  background: transparent;
  color: var(--primaria);
  font-size: 2rem;
  cursor: pointer;
}
.filter-button:hover,
.filter-button[aria-expanded='true'] {
  color: var(--azul-claro);
}
.filters-area {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 20;
  width: min(24rem, 100%);
  max-height: 65dvh;
  overflow-y: auto;
  padding: 1.25rem;
  border: 1px solid #e0e5ec;
  border-radius: 12px;
  background: #fff;
  color: var(--azul-escuro);
  box-shadow: 0 8px 30px rgb(0 18 40 / 15%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.filters-header h3 {
  font-size: 1rem;
}
.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-size: 1.3rem;
  cursor: pointer;
}
.close-button:hover {
  background: #f0f3f7;
}
.multiple-filter {
  border: 0;
  padding: 0;
  min-width: 0;
}
.multiple-filter legend {
  font-size: 0.9rem;
  font-weight: 600;
}
.filter-options {
  max-height: 7rem;
  overflow-y: auto;
  margin-block: 0.4rem;
}
.filters-area .filter-options label {
  flex-direction: row;
  align-items: center;
  padding: 0.4rem;
  border-radius: 6px;
  cursor: pointer;
}
.filter-options label:hover,
.filter-options label:has(input:checked) {
  background: #f0f3f7;
}
.user-avatar,
.user-avatar-default {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}
.user-avatar {
  border-radius: 50%;
  object-fit: cover;
}
.user-avatar-default {
  font-size: 32px;
  line-height: 1;
  color: #9a9a9a;
}
.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.filters-area label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
}
.filters-area select,
.filters-area input[type='date'] {
  max-width: 100%;
  padding: 0.5rem;
  border: 1px solid #9a9a9a;
  border-radius: 6px;
  color: inherit;
  background: transparent;
}
.filters-area .overdue-filter {
  flex-direction: row;
  align-items: center;
  min-height: 40px;
}

@media (max-width: 600px) {
  .search-area { gap: 0.25rem; }
  .search-input :deep(.input-class) { height: 44px; font-size: 16px; }
  .filter-button { width: 44px; height: 44px; font-size: 1.5rem; }
  .filters-area {
    left: 0;
    right: 0;
    width: 100%;
    max-height: 70dvh;
    padding: 1rem;
  }
  .filters-area select,
  .filters-area input[type='date'] { min-height: 44px; font-size: 16px; }
  .filters-area .filter-options label { min-height: 44px; }
}
</style>
