<template>
  <nav
    aria-label="Breadcrumbs"
    class="breadcrumbs"
  >
    <!-- Always present root link -->
    <a href="/" class="breadcrumb-item">Home</a>

    <!-- Dynamically generated trail steps -->
    <a
      v-for="(crumb, index) in crumbs"
      :key="crumb.path"
      :href="crumb.path || '#'"
      @click="go(crumb.path)"
      class="breadcrumb-item"
      :class="{ active: index === crumbs.length - 1 }"
    >
      {{ crumb.label }}
    </a>
  </nav>
</template>

<style scoped>
@reference "@/styles/tailwind.css";
.breadcrumbs {
  @apply flex flex-wrap gap-2 border-b border-design-border-subtle bg-component-list-item-strong-bg px-2 py-2;
}
.breadcrumb-item {
  @apply text-sm font-medium text-design-page-text hover:text-design-page-muted transition-colors;
}
.breadcrumb-item + .breadcrumb-item::before {
  @apply content-['/'] mx-2 text-design-page-text;
}
.active {
  @apply font-bold text-design-page-muted pointer-events-none;
}
</style>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getActivePinia } from "pinia";

const router = useRouter();
const route = useRoute();

// Dynamically locate the instantiated store instance out of the running Pinia registry
const store = computed(() => {
  const pinia = getActivePinia();
  // Look up the store by the title ID assigned in your schema factory
  return (
    (pinia as any)?._s.get("generic-dmscreen-store") ||
    (pinia as any)?._s.get("DMScreen Data Schema")
  );
});

interface Crumb {
  label: string;
  path: string;
}

function findEntityDisplayLabel(entity: any): string {
  if (!entity) return "Loading...";
  return entity.name || entity.title || entity.label || entity.id || "Untitled Record";
}

const crumbs = computed<Crumb[]>(() => {
  const trail: Crumb[] = [];

  // Guard access in case store isn't hydrated immediately
  if (!store.value) return trail;
  let searchContext: any = store.value;

  route.matched.forEach((match) => {
    if (match.path === "/" || match.path === "/:pathMatch(.*)*") return;

    let runtimePath = match.path;
    Object.keys(route.params).forEach((paramKey) => {
      runtimePath = runtimePath.replace(`:${paramKey}`, String(route.params[paramKey]));
    });

    const segments = match.path.split("/");
    const currentSegment = segments[segments.length - 1];

    if (currentSegment.startsWith(":")) {
      const idParamName = currentSegment.substring(1);
      const currentId = route.params[idParamName];

      if (currentId && Array.isArray(searchContext)) {
        const activeEntity = searchContext.find((item: any) => item.id === currentId);
        if (activeEntity) {
          trail.push({
            label: findEntityDisplayLabel(activeEntity),
            path: runtimePath,
          });
          searchContext = activeEntity;
        }
      }
    } else if (currentSegment) {
      const listLabel = currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1);

      trail.push({
        label: listLabel,
        path: runtimePath,
      });

      if (searchContext && searchContext[currentSegment]) {
        searchContext = searchContext[currentSegment];
      }
    }
  });

  return trail;
});

function go(to: string | null) {
  if (to) router.push(to);
}
</script>
