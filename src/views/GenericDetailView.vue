<template>
  <div class="min-h-screen bg-design-page-bg text-design-page-text">
    <!-- Back Navigation & Breadcrumbs -->
    <header class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <button
        @click="goBack"
        class="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
      >
        <span class="mr-2 transform group-hover:-translate-x-0.5 transition-transform">←</span> Back
        to List
      </button>
    </header>

    <!-- Data Loading Placeholder State -->
    <div v-if="!activeEntity" class="text-center py-20 text-slate-500">
      <div class="animate-pulse flex flex-col items-center gap-3">
        <div class="h-8 w-48 bg-slate-200 rounded"></div>
        <div class="h-4 w-64 bg-slate-200 rounded"></div>
      </div>
    </div>

    <!-- Reactive Dynamic Detail Dashboard -->
    <div v-else class="space-y-8">
      <!-- Title Area -->
      <div class="border-b border-slate-200 pb-6">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ activeEntity.name || activeEntity.title || "Untitled Record" }}
        </h1>
        <p v-if="activeEntity.id" class="text-xs font-mono text-slate-400 mt-1">
          ID: {{ activeEntity.id }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div v-for="field in entityFields" :key="field.key" class="grid grid-cols-1 gap-4">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {{ field.label }}
          </span>

          <!-- Specialized Rendering for Status Enums -->
          <span v-if="field.key === 'status'" class="mt-1">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getStatusClasses((activeEntity as any)[field.key])"
            >
              {{ (activeEntity as any)[field.key] }}
            </span>
          </span>

          <!-- Standard Presentation Split: Multiline text vs Standard Primitives -->
          <p
            v-else-if="field.isTextarea"
            class="text-slate-700 text-sm mt-1 whitespace-pre-line leading-relaxed"
          >
            {{ (activeEntity as any)[field.key] || "—" }}
          </p>

          <span v-else class="text-slate-800 text-sm font-medium mt-1">
            {{
              (activeEntity as any)[field.key] !== undefined &&
              (activeEntity as any)[field.key] !== null
                ? (activeEntity as any)[field.key]
                : "—"
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getActivePinia } from "pinia";
import dataSchema from "@/generated/models/data.schema.json";
import { resolveEffectiveSchema } from "@/utils/schema-utils";

const route = useRoute();
const router = useRouter();

// 1. Resolve store context from global running runtime registry
const store = computed(() => {
  const pinia = getActivePinia();
  return (pinia as any)?._s.get("generic-store");
});

/**
 * 2. Deep Nested Entity Context Extractor
 */
const activeEntity = computed(() => {
  if (!store.value) return null;

  const currentParams = route.params;
  const paramKeys = Object.keys(currentParams);

  if (paramKeys.length === 0) return null;

  let currentScope = store.value;
  let leafEntity: any = null;

  route.matched.forEach((match) => {
    const segments = match.path.split("/");
    const lastSegment = segments[segments.length - 1];

    if (lastSegment.startsWith(":")) {
      const idParamName = lastSegment.substring(1);
      const activeId = currentParams[idParamName];

      if (activeId && Array.isArray(currentScope)) {
        const found = currentScope.find((item: any) => item.id === activeId);
        if (found) {
          currentScope = found;
          leafEntity = found;
        }
      }
    } else if (lastSegment && currentScope && currentScope[lastSegment]) {
      currentScope = currentScope[lastSegment];
    }
  });

  return leafEntity;
});

/**
 * 3. Schema Analyzer
 * Matches active parameter namespaces back to explicit properties inside $defs
 */
const currentDefinitionName = computed(() => {
  let matchedDefName = "";
  const matchedRoutes = [...route.matched].reverse();

  for (const match of matchedRoutes) {
    const lastSegment = match.path.split("/").pop() || "";
    if (lastSegment.startsWith(":")) {
      // e.g., transforms parameter mapping "campaignId" -> "campaign"
      matchedDefName = lastSegment.substring(1).replace("Id", "");
      break;
    }
  }
  return matchedDefName;
});

const resolvedSchemaDefinition = computed(() => {
  if (!currentDefinitionName.value) return {};

  // Find case-insensitive property reference matches in schema $defs
  const defKey = Object.keys(dataSchema.$defs).find(
    (k) => k.toLowerCase() === currentDefinitionName.value.toLowerCase(),
  );

  if (!defKey) return {};
  const defsMap = dataSchema.$defs as Record<string, any>;
  return resolveEffectiveSchema(defsMap[defKey], dataSchema);
});

/**
 * 4. Property Map Generation
 */
const entityFields = computed(() => {
  const properties = resolvedSchemaDefinition.value.properties || {};
  return Object.keys(properties)
    .filter((key) => key !== "id" && properties[key].type !== "array")
    .map((key) => {
      const fieldInfo = resolveEffectiveSchema(properties[key], dataSchema);
      return {
        key,
        label: fieldInfo.title || key.charAt(0).toUpperCase() + key.slice(1),
        isTextarea: key === "description" || key === "summary",
      };
    });
});

const subCollections = computed(() => {
  const properties = resolvedSchemaDefinition.value.properties || {};
  return Object.keys(properties)
    .filter((key) => {
      const resolvedField = resolveEffectiveSchema(properties[key], dataSchema);
      return resolvedField.type === "array";
    })
    .map((key) => {
      const fieldInfo = resolveEffectiveSchema(properties[key], dataSchema);
      return {
        key,
        label: fieldInfo.description || key.charAt(0).toUpperCase() + key.slice(1),
      };
    });
});

/**
 * 5. Route Modification Handlers
 */
function goBack() {
  const currentPath = route.path;
  const segments = currentPath.split("/");
  segments.pop();
  router.push(segments.join("/"));
}

function navigateToSubCollection(subKey: string) {
  const targetPath = route.path.endsWith("/")
    ? `${route.path}${subKey}`
    : `${route.path}/${subKey}`;
  router.push(targetPath);
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Draft":
      return "bg-slate-100 text-slate-700";
    case "Ready":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "Ongoing":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Completed":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
</script>
