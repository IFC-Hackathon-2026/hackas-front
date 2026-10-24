<script setup>
import AppInput from '../forms/AppInput.vue';
</script>

<template>
  <section class="events-intro" aria-labelledby="events-title">
    <div class="title">
      <h1 id="events-title">EXPLORE EVENTOS.</h1>
      <p>ENCONTRE TUDO O QUE PRECISA DE FORMA RÁPIDA.</p>
    </div>

    <div class="search-toolbar">
      <div class="search">
        <AppInput label="Buscar eventos" type="search" placeholder="Buscar evento..." icon="mdi-magnify" />
      </div>

      <details class="category-filter" open>
        <summary>
          TODAS AS CATEGORIAS
          <span class="mdi mdi-chevron-down" aria-hidden="true"></span>
        </summary>

        <div class="filter-panel">
          <AppInput label="Buscar categorias" type="search" placeholder="Buscar..." icon="mdi-magnify" />

<!-- filtro ta como exemplo, tem que puxar as categorias do back -->
 
          <fieldset>
            <legend class="visually-hidden">Categorias de eventos</legend>
            <label class="category-option category-option--group">
              <input type="checkbox" />
              <span>Educacionais e Profissionais</span>
            </label>
            <div class="category-children">
              <label class="category-option">
                <input type="checkbox" />
                <span>Acadêmicos</span>
              </label>
              <label class="category-option">
                <input type="checkbox" />
                <span>Workshops</span>
              </label>
              <label class="category-option">
                <input type="checkbox" />
                <span>Palestras</span>
              </label>
            </div>
            <label class="category-option category-option--group">
              <input type="checkbox" />
              <span>Culturais</span>
            </label>
            <label class="category-option category-option--group">
              <input type="checkbox" />
              <span>Esportivos</span>
            </label>
          </fieldset>


        </div>
      </details>
    </div>
  </section>
</template>

<style scoped>
.events-intro {
  max-width: 90%;
  margin: 0 auto;
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
  width: 100%;
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
}

.category-option--group {
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

@media (max-width: 760px) {
  .search-toolbar {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.75rem;
  }

  .filter-panel {
    position: static;
  }
}
</style>
