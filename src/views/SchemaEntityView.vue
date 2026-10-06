<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <section class="border-t border-ink/15 py-5">
    <h2 class="font-display text-xl">{{ route.meta.breadcrumb }}</h2>
    <p class="mt-2 text-sm text-ink/60">This entity has a structural route; its custom view is not implemented yet.</p>
  </section>
</template>