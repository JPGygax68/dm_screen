<template>
  <div class="min-h-screen bg-design-page-bg text-design-page-text">
    <Breadcrumbs />

    <div class="mx-auto max-w-6xl px-4 py-4">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">{{ displayTitle }}</h1>
        <button @click="isModalOpen = true" class="primary">
          <span class="mr-1.5 text-lg font-bold leading-none">+</span> Add {{ entityLabel }}
        </button>
      </header>

      <!-- Data Empty Placeholder State -->
      <div
        v-if="items.length === 0"
        class="text-center text-slate-500 py-16 px-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50"
      >
        <p class="text-base">
          No {{ props.collectionKey }} recorded yet. Click above to add your first record.
        </p>
      </div>

      <!-- Reactive Dynamic Cards Layout -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="item in items"
          :key="item.id"
          class="border border-slate-200 rounded-xl p-6 bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 group"
          @click="navigateToDetail(item.id)"
        >
          <div class="flex flex-col h-full justify-between">
            <div>
              <h3
                class="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1"
              >
                {{ item.name || item.title || "Untitled Record" }}
              </h3>
              <p
                v-if="item.description || item.summary"
                class="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed"
              >
                {{ item.description || item.summary }}
              </p>
            </div>

            <div class="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
              <span
                v-if="item.party"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
              >
                PCs: {{ item.party.length }}
              </span>
              <span
                v-if="item.encounters"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
              >
                Encounters: {{ item.encounters.length }}
              </span>
              <span
                v-if="item.status"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="getStatusClasses(item.status)"
              >
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Schema-Driven Automatic Form Creation Modal Dialog -->
      <div
        v-if="isModalOpen"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
        @click.self="isModalOpen = false"
      >
        <div
          class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all p-6"
        >
          <h2 class="text-xl font-bold text-slate-900 mb-5">New {{ entityLabel }}</h2>

          <form ref="formRef" @submit.prevent="submitForm" class="space-y-4">
            <div v-for="field in formFields" :key="field.key" class="flex flex-col gap-1.5">
              <label :for="field.key" class="text-sm font-semibold text-slate-700">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500 ml-0.5">*</span>
              </label>

              <!-- Dynamic Form Field Routing -->
              <input
                v-if="field.type === 'string'"
                :id="field.key"
                v-model="formData[field.key]"
                type="text"
                :required="field.required"
                :placeholder="field.description"
                @input="checkFormValidity"
                class=""
              />

              <textarea
                v-else-if="field.type === 'text'"
                :id="field.key"
                v-model="formData[field.key]"
                :required="field.required"
                :placeholder="field.description"
                rows="3"
                @input="checkFormValidity"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button type="button" @click="isModalOpen = false" class="secondary">Cancel</button>
              <button type="submit" :disabled="!isFormValid" class="primary">Create Record</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import { ref, computed, watch, reactive, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import dataSchema from "@/generated/models/data.schema.json";
import { resolveEffectiveSchema } from "@/utils/schema-utils";
import { useDmScreenStore } from "@/stores/generic-store";
import Breadcrumbs from "@/components/Breadcrumbs.vue";

const props = defineProps<{
  collectionKey: string; // e.g., "campaigns", "party"
}>();

const route = useRoute();
const router = useRouter();
const isModalOpen = ref(false);
const formData = reactive<Record<string, any>>({});

const store = useDmScreenStore();

/**
 * HELPER TO STAMP HIDDEN METADATA
 * Sets up the non-enumerable properties on newly created records at birth.
 */
function stampMetadata(
  target: any,
  schemaType: string,
  parentId: string | null = null,
  parentType: string | null = null,
  arrayPropertyName: string | null = null
): void {
  if (!target || typeof target !== 'object') return;
  Object.defineProperties(target, {
    __schemaType: { value: schemaType, writable: false, enumerable: false, configurable: true },
    __parentId: { value: parentId, writable: false, enumerable: false, configurable: true },
    __parentType: { value: parentType, writable: false, enumerable: false, configurable: true },
    __arrayPropertyName: { value: arrayPropertyName, writable: false, enumerable: false, configurable: true }
  });
}

/**
 * REAKTIVE CONTEXT-DATEN ENGINE (ABSICHERUNG)
 * Durchsucht den asynchronen Speicherbaum. Verhindert Abstürze beim Anwendungsstart,
 * falls PouchDB die State-Properties noch nicht fertig geladen hat.
 */
const contextData = computed(() => {
  // Absicherung falls der Store noch nicht instanziiert oder geladen ist
  if (!store) return { items: [], parentContext: undefined };

  const currentParams = route.params;
  const paramKeys = Object.keys(currentParams);

  if (paramKeys.length === 0) {
    return {
      // FEHLERSCHUTZ: Falls die Property auf dem Store-Proxy noch 'undefined' ist,
      // geben wir ein leeres Fallback-Array zurück anstatt abzustürzen
      items: store[props.collectionKey] || [],
      parentContext: undefined,
    };
  }

  let currentScope = store as Record<string, any>;
  let activeParentId = "";
  let activeParentType = "";

  route.matched.forEach((match) => {
    const segments = match.path.split("/").filter(Boolean);
    
    segments.forEach((segment) => {
      if (segment.startsWith(":")) {
        const idParamName = segment.substring(1);
        const activeId = currentParams[idParamName];

        if (activeId && Array.isArray(currentScope)) {
          const found = currentScope.find((item: any) => String(item.id) === String(activeId));
          if (found) {
            currentScope = found;
            activeParentId = String(activeId);
          }
        }
      } else {
        if (currentScope && typeof currentScope === "object") {
          if (currentScope[segment]) {
            currentScope = currentScope[segment];
          }

          const defsMap = dataSchema.$defs as Record<string, any>;
          for (const defKey of Object.keys(defsMap)) {
            const parentSchema = resolveEffectiveSchema(defsMap[defKey], dataSchema);
            if (parentSchema.properties && parentSchema.properties[segment]) {
              activeParentType = parentSchema.title || defKey;
              break;
            }
          }
        }
      }
    });
  });

  console.log('Context data computed:', JSON.parse(JSON.stringify(contextData.value)));
  return {
    items: Array.isArray(currentScope)
      ? currentScope
      : (currentScope && currentScope[props.collectionKey]) ? currentScope[props.collectionKey] : [],
    parentContext: activeParentId 
      ? { key: props.collectionKey, id: activeParentId, parentType: activeParentType } 
      : undefined,
  };
});

const items = computed(() => contextData.value.items || []);

const collectionDefinition = computed(() => {
  const propertiesMap = dataSchema.properties as Record<string, any>;
  if (propertiesMap[props.collectionKey]) {
    return resolveEffectiveSchema(propertiesMap[props.collectionKey], dataSchema);
  }

  const defsMap = dataSchema.$defs as Record<string, any>;
  for (const defKey of Object.keys(defsMap)) {
    const parentSchema = resolveEffectiveSchema(defsMap[defKey], dataSchema);
    if (parentSchema.properties && parentSchema.properties[props.collectionKey]) {
      return resolveEffectiveSchema(parentSchema.properties[props.collectionKey], dataSchema);
    }
  }
  return {};
});

const itemDefinition = computed(() => {
  return resolveEffectiveSchema(collectionDefinition.value.items, dataSchema);
});

const displayTitle = computed(() => {
  const def = collectionDefinition.value;
  return def.title || props.collectionKey.charAt(0).toUpperCase() + props.collectionKey.slice(1);
});

const entityLabel = computed(() => itemDefinition.value.title || "Record");

const formFields = computed(() => {
  const schemaProps = itemDefinition.value.properties || {};
  const requiredList = itemDefinition.value.required || [];

  return Object.keys(schemaProps)
    .filter((key) => key !== "id" && schemaProps[key].type !== "array")
    .map((key) => {
      const fieldInfo = resolveEffectiveSchema(schemaProps[key], dataSchema);
      const inputFormType = key === "description" || key === "summary" ? "text" : "string";

      return {
        key,
        label: fieldInfo.title || key.charAt(0).toUpperCase() + key.slice(1),
        type: inputFormType,
        required: requiredList.includes(key),
        description: fieldInfo.description || "",
        default: fieldInfo.default,
      };
    });
});

const formRef = ref<HTMLFormElement | null>(null);
const isFormValid = ref(false);

function checkFormValidity() {
  if (formRef.value) {
    isFormValid.value = formRef.value.checkValidity();
  }
}

watch(isModalOpen, async (isOpen) => {
  if (isOpen) {
    Object.keys(formData).forEach((k) => delete formData[k]);
    formFields.value.forEach((f) => {
      formData[f.key] = f.default !== undefined ? f.default : "";
    });
    await nextTick();
    checkFormValidity();
  } else {
    isFormValid.value = false;
  }
});

function getStatusClasses(status: string) {
  switch (status) {
    case "Draft": return "bg-slate-100 text-slate-700";
    case "Ready": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "Ongoing": return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Completed": return "bg-blue-50 text-blue-700 border border-blue-200";
    default: return "bg-slate-100 text-slate-600";
  }
}

function navigateToDetail(id: string) {
  const targetPath = route.path.endsWith("/") ? `${route.path}${id}` : `${route.path}/${id}`;
  router.push(targetPath);
}

/**
 * PURE METADATA FORM SUBMISSION
 * Seeds the item record, injects hidden tracking parameters, updates memory arrays,
 * and passes execution to store.persistEntity().
 */
function submitForm() {
  const generatedId = crypto.randomUUID().split("-")[0]; // Fast temporary 8-char hex chunk

  const newRecord = {
    id: generatedId,
    ...formData,
  } as Record<string, any>;

  // Pre-seed any child array parameters declared inside the schema definition empty
  const schemaProps = itemDefinition.value.properties || {};
  Object.keys(schemaProps).forEach((key) => {
    const resolvedChild = resolveEffectiveSchema(schemaProps[key], dataSchema);
    if (resolvedChild.type === "array") {
      newRecord[key] = [];
    }
  });

  const structuralType = itemDefinition.value.title || "UnknownType";
  const parentCtx = contextData.value.parentContext;

  // 1. INJECT INVISIBLE RUNTIME TRACKING METADATA
  if (parentCtx) {
    // Nested child item (e.g. PlayerCharacter inside Campaign)
    stampMetadata(
      newRecord,
      structuralType,
      parentCtx.id,
      parentCtx.parentType,
      props.collectionKey
    );
  } else {
    // Root level item (e.g. top-level Campaign)
    stampMetadata(
      newRecord,
      structuralType,
      null,
      null,
      props.collectionKey
    );
  }

  // 2. MUTATE LOCAL REACTIVE MEMORY LIST ARRAY IN PLACE
  // Because contextData.items points directly into your live tree layout, pushing updates the UI instantly
  contextData.value.items.push(newRecord);

  // 3. STREAM THE MUTATED ENTITY STRIPPED AND SHALLOW DOWN TO DISK
  store.persistEntity(newRecord);
  
  isModalOpen.value = false;
}
</script>
