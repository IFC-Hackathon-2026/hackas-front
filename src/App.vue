<script setup>
import AppFooterComponent from './components/layout/AppFooterComponent.vue';
import AppHeaderComponent from './components/layout/appHeaderComponent.vue';

</script>

<template>
  <div class="app-layout">
    <AppHeaderComponent />
    <main class="app-content">
      <RouterView />
    </main>
    <AppFooterComponent />
  </div>
</template>

<style scoped>
.app-layout {
  --page-padding: 2rem;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding-inline: var(--page-padding);
}

@media (max-width: 760px) {
  .app-layout {
    --page-padding: 1.25rem;
  }
}
</style>
