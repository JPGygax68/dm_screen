<template>
  <div class="min-h-screen bg-slate-50/50 text-slate-900 font-sans">
    <Breadcrumbs />

    <div class="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <!-- Back Navigation Bar -->
      <header
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4"
      >
        <button @click="goBack" class="secondary inline-flex group">
          <span class="mr-2 transform group-hover:-translate-x-0.5 transition-transform">←</span>
          Back
        </button>

        <!-- Dynamic Action Switches -->
        <div class="flex items-center gap-2">
          <button v-if="!isEditing" @click="startEditing" class="secondary">Edit Record</button>
          <template v-else>
            <button @click="cancelEditing" class="secondary">Cancel</button>
            <button @click="saveChanges" :disabled="!isFormValid" class="">Save Changes</button>
          </template>
        </div>
      </header>

      <!-- Data Loading Placeholder State -->
      <div
        v-if="!activeEntity"
        class="text-center py-20 text-slate-500 bg-white border border-slate-200 rounded-xl"
      >
        <div class="animate-pulse flex flex-col items-center gap-3">
          <div class="h-8 w-48 bg-slate-200 rounded"></div>
          <div class="h-4 w-64 bg-slate-200 rounded"></div>
        </div>
      </div>

      <!-- Reactive Dashboard Layout Split -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- MAIN CONTENT PANEL: Presentation Fields -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white border border-slate-200 shadow-2xs rounded-xl p-6 space-y-6">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
                {{ activeEntity.name || activeEntity.title || "Untitled Record" }}
              </h1>
              <p
                v-if="activeEntity.id"
                class="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider"
              >
                System Key: {{ activeEntity.id }}
              </p>
            </div>

            <form
              ref="formRef"
              @submit.prevent
              class="grid grid-cols-1 gap-5 border-t border-slate-100 pt-4"
            >
              <div v-for="field in entityFields" :key="field.key" class="flex flex-col gap-1">
                <label
                  :for="field.key"
                  class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                >
                  {{ field.label }}
                </label>

                <!-- EDIT MODE FIELDS -->
                <template v-if="isEditing">
                  <input
                    v-if="!field.isTextarea"
                    :id="field.key"
                    v-model="editData[field.key]"
                    type="text"
                    @input="checkFormValidity"
                  />
                  <textarea
                    v-else
                    :id="field.key"
                    v-model="editData[field.key]"
                    rows="4"
                    @input="checkFormValidity"
                  ></textarea>
                </template>

                <!-- PRESENTATION VIEW MODE FIELDS -->
                <template v-else>
                  <span v-if="field.key === 'status'" class="mt-0.5">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border"
                      :class="getStatusClasses(activeEntity[field.key])"
                    >
                      {{ activeEntity[field.key] }}
                    </span>
                  </span>
                  <p
                    v-else-if="field.isTextarea"
                    class="text-slate-700 text-sm mt-0.5 whitespace-pre-line leading-relaxed bg-slate-50/30 p-3 rounded-lg border border-slate-100"
                  >
                    {{ activeEntity[field.key] || "—" }}
                  </p>
                  <span v-else class="text-slate-800 text-sm font-semibold mt-0.5">
                    {{
                      activeEntity[field.key] !== undefined && activeEntity[field.key] !== null
                        ? activeEntity[field.key]
                        : "—"
                    }}
                  </span>
                </template>
              </div>
            </form>
          </div>
        </div>

        <!-- SIDEBAR PANEL: Navigating Deeper Into Sub-Collections -->
        <div class="space-y-6">
          <div
            v-if="subCollections.length > 0"
            class="bg-slate-100/60 border border-slate-200 rounded-xl p-5 space-y-4"
          >
            <div>
              <h2 class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sub-Collections
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">
                Select a category below to explore its records.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <button
                v-for="sub in subCollections"
                :key="sub.key"
                @click="navigateToSubCollection(sub.key)"
                class="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm rounded-xl text-left text-sm font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer group"
              >
                <span>{{ sub.label }}</span>
                <span class="inline-flex items-center gap-2">
                  <span
                    class="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 font-medium transition-colors"
                  >
                    {{ activeEntity[sub.key]?.length || 0 }}
                  </span>
                  <span
                    class="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-0.5 transition-all"
                    >→</span
                  >
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import dataSchema from "@/generated/models/data.schema.json";
import { resolveEffectiveSchema } from "@/utils/schema-utils";
import { useDmScreenStore } from "@/stores/generic-store";

const route = useRoute();
const router = useRouter();
const store = useDmScreenStore();

// Inline Form Modification Hooks
const isEditing = ref(false);
const isFormValid = ref(true);
const formRef = ref<HTMLFormElement | null>(null);
const editData = reactive<Record<string, any>>({});

/**
 * Safely extracts primitive fields out of the active entity context
 */
function getFieldValue(key: string): any {
  if (!activeEntity.value) return "";
  return (activeEntity.value as Record<string, any>)[key];
}

/**
 * Deep Nested Entity Context Extractor
 */
const activeEntity = computed(() => {
  if (!store) return null;

  const currentParams = route.params;
  const paramKeys = Object.keys(currentParams);
  if (paramKeys.length === 0) return null;

  let currentScope: any = store;
  let leafEntity: any = null;

  route.matched.forEach((match) => {
    const segments = match.path.split("/").filter(Boolean);

    segments.forEach((segment) => {
      if (segment.startsWith(":")) {
        const idParamName = segment.substring(1);
        const activeId = currentParams[idParamName];

        if (activeId && Array.isArray(currentScope)) {
          const found = currentScope.find((item: any) => item.id === String(activeId));
          if (found) {
            currentScope = found;
            leafEntity = found;
          }
        }
      } else {
        if (currentScope && typeof currentScope === "object") {
          if (currentScope[segment]) {
            currentScope = currentScope[segment];
          } else if (currentScope._collections && currentScope._collections[segment]) {
            currentScope = currentScope._collections[segment];
          }
        }
      }
    });
  });

  return leafEntity;
});

/**
 * Schema Analyzer
 */
const currentDefinitionName = computed(() => {
  let matchedDefName = "";
  const matchedRoutes = [...route.matched].reverse();

  for (const match of matchedRoutes) {
    const lastSegment = match.path.split("/").pop() || "";
    if (lastSegment.startsWith(":")) {
      matchedDefName = lastSegment.substring(1).replace("Id", "");
      break;
    }
  }
  return matchedDefName;
});

const resolvedSchemaDefinition = computed(() => {
  if (!currentDefinitionName.value) return {};
  const defKey = Object.keys(dataSchema.$defs).find(
    (k) => k.toLowerCase() === currentDefinitionName.value.toLowerCase(),
  );
  if (!defKey) return {};
  const defsMap = dataSchema.$defs as Record<string, any>;
  return resolveEffectiveSchema(defsMap[defKey], dataSchema);
});

/**
 * Property Map Generation
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
        label:
          fieldInfo.description || fieldInfo.title || key.charAt(0).toUpperCase() + key.slice(1),
      };
    });
});

/**
 * Inline Editing Handlers
 */
function startEditing() {
  if (!activeEntity.value) return;
  Object.keys(editData).forEach((k) => delete editData[k]);
  entityFields.value.forEach((f) => {
    editData[f.key] = activeEntity.value[f.key] !== undefined ? activeEntity.value[f.key] : "";
  });
  isEditing.value = true;
  isFormValid.value = true;
}

function cancelEditing() {
  isEditing.value = false;
}

function checkFormValidity() {
  nextTick(() => {
    if (formRef.value) {
      isFormValid.value = formRef.value.checkValidity();
    }
  });
}

function saveChanges() {
  if (!activeEntity.value) return;

  // 1. Mutate the active tracked record directly in place
  // This preserves our hidden non-enumerable metaproperties perfectly!
  Object.keys(editData).forEach((key) => {
    (activeEntity.value as Record<string, any>)[key] = editData[key];
  });

  // 2. Hand the original tracked object reference directly to the store
  store.persistEntity(activeEntity.value);

  isEditing.value = false;
}

/**
 * Route Modification Handlers
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
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "Ready":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Ongoing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Completed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}
</script>
