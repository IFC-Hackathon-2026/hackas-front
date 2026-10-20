<script setup>
import { computed, ref, watch } from "vue";
import appInput from '@/components/form/appInput.vue'

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
});

const emit = defineEmits(["change"]);

const pageInput = ref(props.currentPage);

watch(
  () => props.currentPage,
  (val) => {
    pageInput.value = val;
  }
);

function changePage(page) {
  page = Number(page);

  if (page >= 1 && page <= props.totalPages) {
    emit("change", page);
  }
}

function goToPage() {
  changePage(pageInput.value);
}

const visiblePages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;

  // poucas páginas
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // começo
  if (current <= 2) {
    return [1, 2, 3, "...", total];
  }

  // final
  if (current >= total - 1) {
    return [1, "...", total - 2, total - 1, total];
  }

  // meio
  return [
    1,
    "...",
    current - 1,
    current,
    current + 1,
    "...",
    total,
  ];
});
</script>

<template >
<nav class="pagination" v-if="totalPages > 1">

<div class="go-to">

  <div class="page-input-wrapper">
    <appInput
      v-model="pageInput"
      type="number"
      variant="terciary"
      placeholder="1"
    />
  </div>

  <button class="go-btn" @click="goToPage">
    Ir
  </button>

</div>

  <div class="pages">

    <button
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      <span class="mdi mdi-arrow-left"></span>
    </button>

    <template v-for="(page, index) in visiblePages" :key="index">

      <span v-if="page === '...'" class="dots">
        ...
      </span>

      <button
        v-else
        @click="changePage(page)"
        class="page-btn"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>

    </template>

    <button
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      <span class="mdi mdi-arrow-right"></span>
    </button>

  </div>

</nav>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  margin: 30px 0;
}

.pages {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination button {
  border: none;
  padding: 9px 11px;
  border-radius: 50%;
  font-weight: 600;
  cursor: pointer;
  background-color: var(--fundo-claro);
  color: var(--principal-claro);
  transition: 0.2s ease;
}

.page-btn.active {
  background-color: var(--principal-claro);
  color: white;
}

.page-btn:hover:not(:disabled) {
  background-color: var(--principal-claro);
  color: white;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination .mdi {
  font-size: 22px;
}

.dots {
  font-size: 18px;
  font-weight: bold;
  color: var(--principal-claro);
}

.go-to {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 12px;

  background: var(--fundo-claro);

  padding: 10px 14px;

  border-radius: 14px;

  border: 1px solid rgba(0, 0, 0, 0.08);

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.page-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;

  transform: translateY(-7px);
}

.go-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 40px;
  min-width: 48px;

  margin: 0 !important;
  padding: 0 16px !important;

  border-radius: 10px !important;

  background-color: var(--principal-claro) !important;
  color: white !important;

  font-weight: 600;
  line-height: 1;
}

.go-btn:hover {
  opacity: 0.9;
}

/* Paginação um pouco maior em telas >= 950px */
@media (min-width: 950px) {
  .pagination {
    gap: 22px;
    margin: 38px 0;
  }

  .pages {
    gap: 12px;
  }

  .pagination button {
    padding: 12px 15px;
    font-size: 16px;
  }

  .pagination .mdi {
    font-size: 26px;
  }

  .dots {
    font-size: 22px;
  }

  .go-to {
    gap: 16px;
    padding: 13px 18px;
    border-radius: 16px;
  }

  .go-btn {
    padding: 13px 20px !important;
    font-size: 16px;
  }
}
</style>
