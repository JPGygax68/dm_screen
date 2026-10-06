<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <RouterView v-if="route.meta.workflow" />
  <section v-else class="mt-6 border-t border-ink/15 py-5">
    <h2 class="font-display text-xl">{{ route.meta.breadcrumb }}</h2>
    <RouterView />
  </section>
</template>