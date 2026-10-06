<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import { useDataStore } from "./stores/data-store.ts";

const store = useDataStore();
const isLoading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
  try {
    await store.load();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to load local data.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <main v-if="isLoading" class="grid min-h-dvh place-items-center text-ink/65">
    Opening your local archive...
  </main>
  <main v-else-if="errorMessage" class="mx-auto max-w-3xl px-6 py-10 text-red-700" role="alert">
    {{ errorMessage }}
  </main>
  <RouterView v-else />
</template>