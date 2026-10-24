<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppInput from '../forms/AppInput.vue';
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_LABELS, PROJECT_CATEGORY_STYLES } from '@/constants/projectCategories'
import { useProjetoStore } from '@/stores/projetoStore'

const projetoStore = useProjetoStore()
const buscaProjeto = ref('')
const buscaCategoria = ref('')
const categoriasSelecionadas = ref([])
let buscaTimer

function filtrarArvore(categorias, termo) {
  return categorias
    .map((categoria) => {
      const corresponde = categoria.label.toLocaleLowerCase('pt-BR').includes(termo)
      return {
        ...categoria,
        children: corresponde
          ? categoria.children
          : filtrarArvore(categoria.children ?? [], termo),
      }
    })
    .filter((categoria) =>
      categoria.label.toLocaleLowerCase('pt-BR').includes(termo)
      || categoria.children.length,
    )
}

const categoriasFiltradas = computed(() => {
  const termo = buscaCategoria.value.trim().toLocaleLowerCase('pt-BR')
  if (!termo) return PROJECT_CATEGORIES
  return filtrarArvore(PROJECT_CATEGORIES, termo)
})

const tituloFiltro = computed(() => {
  const quantidade = categoriasSelecionadas.value.length
  return quantidade ? `${quantidade} CATEGORIA${quantidade > 1 ? 'S' : ''}` : 'TODAS AS CATEGORIAS'
})

async function carregarProjetos() {
  await projetoStore.getProjetos({
    search: buscaProjeto.value.trim() || undefined,
    categorias: categoriasSelecionadas.value.length
      ? categoriasSelecionadas.value
      : undefined,
    page_size: 100,
  })
}

function limparCategorias() {
  categoriasSelecionadas.value = []
}

watch([buscaProjeto, categoriasSelecionadas], () => {
  window.clearTimeout(buscaTimer)
  buscaTimer = window.setTimeout(carregarProjetos, 300)
}, { deep: true })

onMounted(async () => {
  await carregarProjetos()
})

onBeforeUnmount(() => window.clearTimeout(buscaTimer))
</script>

<template>
  <section class="events-intro" aria-labelledby="events-title">
    <div class="title">
      <h1 id="events-title">EXPLORE EVENTOS.</h1>
      <p>ENCONTRE TUDO O QUE PRECISA DE FORMA RÁPIDA.</p>
    </div>

    <div class="search-toolbar">
      <div class="search">
        <AppInput v-model="buscaProjeto" label="Buscar eventos" type="search" placeholder="Buscar evento..." icon="mdi-magnify" />
      </div>

      <details class="category-filter">
        <summary>
          {{ tituloFiltro }}
          <span class="mdi mdi-chevron-down" aria-hidden="true"></span>
        </summary>

        <div class="filter-panel">
          <AppInput v-model="buscaCategoria" label="Buscar categorias" type="search" placeholder="Buscar categoria..." icon="mdi-magnify" />
 
          <fieldset>
            <legend class="visually-hidden">Categorias de eventos</legend>
            <button v-if="categoriasSelecionadas.length" type="button" class="clear-filter" @click="limparCategorias">
              Limpar seleção
            </button>
            <div v-for="categoria in categoriasFiltradas" :key="categoria.value" class="category-group">
              <label class="category-option category-option--group" :style="{ color: categoria.textColor || categoria.color }">
                <input v-model="categoriasSelecionadas" type="checkbox" :value="categoria.value" />
                <span>{{ categoria.label }}</span>
              </label>
              <div v-if="categoria.children.length" class="category-children">
                <div v-for="subcategoria in categoria.children" :key="subcategoria.value">
                  <label class="category-option">
                    <input v-model="categoriasSelecionadas" type="checkbox" :value="subcategoria.value" />
                    <span>{{ subcategoria.label }}</span>
                  </label>
                  <div v-if="subcategoria.children?.length" class="category-grandchildren">
                    <label v-for="item in subcategoria.children" :key="item.value" class="category-option">
                      <input v-model="categoriasSelecionadas" type="checkbox" :value="item.value" />
                      <span>{{ item.label }}</span>
                    </label>
                  </div>
                </div>
              </div> 
            </div>
            <p v-if="!categoriasFiltradas.length" class="empty-filter">Nenhuma categoria encontrada.</p>
          </fieldset>


        </div>
      </details>
    </div>

    <p v-if="projetoStore.loading" class="results-status">Carregando eventos...</p>
    <p v-else-if="projetoStore.error" class="results-status results-status--error">Não foi possível carregar os eventos.</p>
    <div v-else class="event-results" aria-live="polite">
      <article v-for="projeto in projetoStore.projetos" :key="projeto.id" class="event-card">
        <img v-if="projeto.foto?.url" :src="projeto.foto.url" :alt="`Imagem de ${projeto.nome}`" />
        <div v-else class="event-placeholder" aria-hidden="true"></div>
        <div class="event-card__content">

          <div class="event-tags">
            <span v-for="categoria in projeto.categorias" :key="categoria" :style="{ color: PROJECT_CATEGORY_STYLES[categoria]?.color, backgroundColor: PROJECT_CATEGORY_STYLES[categoria]?.background }">
              <span :class="['mdi', PROJECT_CATEGORY_STYLES[categoria]?.icon || 'mdi-tag-outline']" aria-hidden="true"></span>
              {{ PROJECT_CATEGORY_LABELS[categoria] ?? categoria }}
            </span>
          </div>
          <h2>{{ projeto.nome }}</h2>
          <p>{{ projeto.descricao || 'Sem descrição.' }}</p>
          <RouterLink class="event-details" :to="{ name: 'detailsEventsView', params: { id: projeto.id } }" :aria-label="`Ver detalhes de ${projeto.nome}`">
            Ver detalhes
            <span class="mdi mdi-arrow-right" aria-hidden="true"></span>
          </RouterLink>
          
        </div>
      </article>
      <p v-if="!projetoStore.projetos.length" class="results-status">Nenhum evento corresponde aos filtros.</p>
    </div>
  </section>
</template>

<style scoped>
.events-intro {
  max-width: 90%;
  margin: 20px auto;
  padding-block: clamp(2rem, 5vw, 4rem) 2rem;
  color: var(--azul-escuro, #001228);
}

.title h1 {
  margin-bottom: 0.75rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 500;
}

.title p {
  margin-bottom: 1.25rem;
  color: var(--primaria, #00265c);
  font-size: clamp(0.875rem, 1.5vw, 1.125rem);
  font-weight: 600;
}

.search-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
  gap: 2rem;
}

.search,
.category-filter {
  min-width: 0;
}

.search-toolbar :deep(.app-input) {
  margin-bottom: 0;
}

.search-toolbar :deep(.label-class),
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.search-toolbar :deep(.input-class) {
  height: 56px;
  background: #fff;
  border-width: 1px;
  border-color: var(--azul-escuro, #001228);
  font-size: 1rem;
}

.category-filter {
  position: relative;
  width: 320px;
  max-width: 100%;
}

.category-filter summary {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  min-height: 56px;
  color: var(--primaria, #00265c);
  font-size: 1.125rem;
  font-weight: 700;
  list-style: none;
  cursor: pointer;
}

.category-filter summary::-webkit-details-marker {
  display: none;
}

.category-filter summary .mdi {
  font-size: 1.75rem;
}

.category-filter[open] summary .mdi {
  transform: rotate(180deg);
}

.filter-panel {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 5;
  width: 320px;
  max-width: 100%;
  max-height: min(480px, 65dvh);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 5px 18px rgb(0 18 40 / 16%);
}

.filter-panel :deep(.input-class) {
  border-color: #5b7399;
  color: var(--primaria, #00265c);
}

.filter-panel fieldset {
  min-width: 0;
  margin: 1rem 0 0;
  padding: 0;
  border: 0;
}

.category-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding-block: 0.375rem;
  font-size: 0.9375rem;
  cursor: pointer;
  min-width: 0;
  overflow-wrap: anywhere;
}

.category-option span {
  min-width: 0;
}

.category-option--group {
  padding-inline: 0.5rem;
  border-radius: 4px;
  font-weight: 700;
}

.category-option input {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: var(--primaria, #00265c);
}

.category-children {
  padding-left: 1.75rem;
}

.category-grandchildren {
  padding-left: 1.75rem;
}

.clear-filter {
  width: 100%;
  padding: 0.35rem 0;
  border: 0;
  background: transparent;
  color: var(--primaria, #00265c);
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.category-group + .category-group {
  margin-top: 0.25rem;
}

.empty-filter,
.results-status {
  color: #5f6875;
}

.results-status {
  margin-top: 2rem;
  text-align: center;
}

.results-status--error {
  color: #b42318;
}

.event-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.event-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgb(0 18 40 / 8%);
}

.event-card img,
.event-placeholder {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #e9e9e9;
}

.event-card__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
}

.event-card__content h2 {
  margin: 0.5rem 0;
  font-size: 1.15rem;
}

.event-card__content p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #4c5665;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: flex-end;
}

.event-tags > span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem;
  background: #e7f0fb;
  border-radius: 999px;
  color: var(--primaria, #00265c);
  font-size: 0.75rem;
  font-weight: 600;
}

.event-details {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  width: 100%;
  min-height: 38px;
  gap: 0.5rem;
  margin-top: auto;
  padding: 5px 14px;
  border: 1px solid #2767aa;
  border-radius: 6px;
  color: var(--primaria);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.event-details:hover {
  background: #f0f5fb;
}

.event-details:focus-visible {
  outline: 2px solid #2767aa;
  outline-offset: 3px;
}

.event-card {
  display: flex;
  flex-direction: column;
}

.event-card__content > p {
  margin-bottom: 20px;
}

@media (max-width: 760px) {
  .search-toolbar {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }

  .filter-panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .events-intro {
    width: calc(100% - 1rem);
    max-width: calc(100% - 1rem);
    margin: 0 auto;
    padding-block: 1.5rem;
  }
  .title h1 {
    font-size: 1.5rem;
  }
  .title p {
    font-size: 0.875rem;
    line-height: 1.5;
  }
  .search-toolbar {
    gap: 1rem;
  }
  .search-toolbar :deep(.input-class) {
    height: 48px;
    min-width: 0;
    font-size: 16px;
  }
  .category-filter summary {
    min-height: 48px;
    font-size: 0.875rem;
    gap: 0.5rem;
  }
  .filter-panel {
    box-sizing: border-box;
    padding: 0.75rem;
  }
  .category-option {
    min-height: 44px;
    align-items: center;
  }
  .category-filter,
  .filter-panel {
    width: 100%;
  }
  .event-results {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
  }
  .event-card img,
  .event-placeholder {
    height: auto;
    aspect-ratio: 16 / 9;
  }
  .event-card__content {
    padding: 0.875rem;
  }
  .event-tags {
    justify-content: flex-start;
  }
  .event-details {
    min-height: 44px;
  }
}
</style>
