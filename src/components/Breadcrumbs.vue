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
import { useDmScreenStore } from "@/stores/generic-store";
import dataSchema from "@/generated/models/data.schema.json";

const router = useRouter();
const route = useRoute();
const store = useDmScreenStore();

interface Crumb {
  label: string;
  path: string;
}

function findEntityDisplayLabel(entity: any): string {
  if (!entity) return "Loading...";
  return entity.name || entity.title || entity.label || entity.id || "Untitled Record";
}

/**
 * PATH-DRIVEN BREADCRUMB ENGINE
 * Dissects the physical active browser URL path string token-by-token.
 * This guarantees that both collection keys and individual record entries are
 * sequentially tracked regardless of flat route structure declarations.
 */
const crumbs = computed<Crumb[]>(() => {
  const trail: Crumb[] = [];

  // Guard access in case store or its tracking collection dictionary is missing on boot
  if (!store) return trail;
  
  // Track our context depth location map starting inside Pinia's database root matrix
  let searchContext: any = store;
  let accumulatedPath = "";

  // Split the physical active path string into individual layout folder tokens
  // e.g., "/campaigns/fa821c09" -> ["campaigns", "fa821c09"]
  const physicalSegments = route.path.split("/").filter(Boolean);

  physicalSegments.forEach((segment) => {
    accumulatedPath += `/${segment}`;

    // 1. IS IT AN ID RECORD LOOKUP PASS?
    // If our search context is an array, this path segment represents an individual record ID string
    if (Array.isArray(searchContext)) {
      const activeEntity = searchContext.find((item: any) => String(item.id) === String(segment));
      
      if (activeEntity) {
        trail.push({
          label: findEntityDisplayLabel(activeEntity),
          path: accumulatedPath,
        });
        // Shift our active search target directly into this object context
        searchContext = activeEntity;
      } else {
        // Fallback title card if database records are loading asynchronously
        trail.push({ label: "Loading...", path: accumulatedPath });
      }
    } 
    // 2. IS IT A LITERAL COLLECTION NAME KEY?
    else if (searchContext && typeof searchContext === "object") {
      const collectionPropertyKey = segment;

      // Read singular schema def titles directly from metadata profiles to map clean labels
      const schemaDefKey = Object.keys(dataSchema.$defs).find(
        (k) => k.toLowerCase() === collectionPropertyKey.replace(/s$/, "").toLowerCase()
      );
      const schemaDef = schemaDefKey ? (dataSchema.$defs as any)[schemaDefKey] : null;
      
      const listLabel = schemaDef?.title 
        ? `${schemaDef.title}s` 
        : collectionPropertyKey.charAt(0).toUpperCase() + collectionPropertyKey.slice(1);

      trail.push({
        label: listLabel,
        path: accumulatedPath,
      });

      // Shift search pointer focus directly down to the targeted sub-array category branch block
      searchContext = searchContext[collectionPropertyKey];
    }
  });

  return trail;
});

function go(to: string | null) {
  if (to) router.push(to);
}
</script>
