<script setup>
import { RouterView, useRoute } from 'vue-router';
import AppFooterComponent from './components/layout/AppFooterComponent.vue';
import AppHeaderComponent from './components/layout/appHeaderComponent.vue';

const route = useRoute();
</script>

<template>
  <div class="app-layout" :class="{ 'config-layout': ['config', 'dashboard'].includes(route.name) }">
    <AppHeaderComponent v-if="!route.meta.hideHeader" />
    <main class="app-content">
      <RouterView :class="{ 'no-header': route.meta.hideHeader }" />
    </main>
    <AppFooterComponent v-if="!route.meta.hideFooter" />
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

.config-layout {
  --fundo-claro: #fff;
  background-color: #fff;
}


.no-header {
  margin-top: 0;
}
@media (max-width: 760px) {
  .app-layout {
    --page-padding: 1.25rem;
  }
}
</style>
