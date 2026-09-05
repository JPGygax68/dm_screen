<template>
  <div class="min-h-screen bg-design-page-bg text-design-page-text">
    <Breadcrumbs />

    <div class="mx-auto max-w-6xl px-4 py-4">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">{{ displayTitle }}</h1>
        <button
          @click="isModalOpen = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
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

          <form @submit.prevent="submitForm" class="space-y-4">
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
                class="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-xs text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all placeholder:text-slate-400"
              />

              <textarea
                v-else-if="field.type === 'text'"
                :id="field.key"
                v-model="formData[field.key]"
                :required="field.required"
                :placeholder="field.description"
                rows="3"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-xs text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all placeholder:text-slate-400 resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                @click="isModalOpen = false"
                class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors cursor-pointer"
              >
                Create Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getActivePinia } from "pinia";
import dataSchema from "@/generated/models/data.schema.json";
import { resolveEffectiveSchema } from "@/utils/schema-utils";

const props = defineProps<{
  collectionKey: string; // The key in the data schema representing the collection to display
}>();

const route = useRoute();
const router = useRouter();
const isModalOpen = ref(false);
const formData = reactive<Record<string, any>>({});

const store = computed(() => {
  const pinia = getActivePinia();
  console.log("Active Pinia instance:", pinia);
  return (pinia as any)?._s.get("generic-store");
});

const contextData = computed(() => {
  if (!store.value) return { items: [], parentContext: undefined };

  const currentParams = route.params;
  const paramKeys = Object.keys(currentParams);

  if (paramKeys.length === 0) {
    return {
      items: store.value[props.collectionKey] || [],
      parentContext: undefined,
    };
  }

  let currentScope = store.value;
  let activeParentId = "";

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
          activeParentId = String(activeId);
        }
      }
    } else if (lastSegment && currentScope && currentScope[lastSegment]) {
      currentScope = currentScope[lastSegment];
    }
  });

  return {
    items: Array.isArray(currentScope) ? currentScope : currentScope[props.collectionKey] || [],
    parentContext: activeParentId ? { key: props.collectionKey, id: activeParentId } : undefined,
  };
});

const items = computed(() => contextData.value.items);

const resolvedDefinition = computed(() => {
  // Cast properties to Record<string, any> to bypass strict literal property checking
  const propertiesMap = dataSchema.properties as Record<string, any>;
  const rootProp = resolveEffectiveSchema(propertiesMap[props.collectionKey], dataSchema);
  console.log("Resolved Definition for", props.collectionKey, rootProp);
  return rootProp;
  // return resolveEffectiveSchema(rootProp.items, dataSchema);
});

const displayTitle = computed(() => {
  const propertiesMap = dataSchema.properties as Record<string, any>;
  console.log("properties", propertiesMap[props.collectionKey]);
  return (
    //propertiesMap[props.collectionKey]?.description ||
    resolvedDefinition.value.title ||
    resolvedDefinition.value.description ||
    props.collectionKey.charAt(0).toUpperCase() + props.collectionKey.slice(1)
  );
});

const entityLabel = computed(() => {
  return resolvedDefinition.value.title || props.collectionKey.replace(/s$/, "");
});

const formFields = computed(() => {
  const schemaProps = resolvedDefinition.value.properties || {};
  const requiredList = resolvedDefinition.value.required || [];

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

watch(isModalOpen, (isOpen) => {
  if (isOpen) {
    Object.keys(formData).forEach((k) => delete formData[k]);
    formFields.value.forEach((f) => {
      formData[f.key] = f.default !== undefined ? f.default : "";
    });
  }
});

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

function navigateToDetail(id: string) {
  const targetPath = route.path.endsWith("/") ? `${route.path}${id}` : `${route.path}/${id}`;
  router.push(targetPath);
}

function submitForm() {
  const newRecord = {
    id: crypto.randomUUID(),
    ...formData,
  } as Record<string, any>;

  const schemaProps = resolvedDefinition.value.properties || {};
  Object.keys(schemaProps).forEach((key) => {
    const resolvedChild = resolveEffectiveSchema(schemaProps[key], dataSchema);
    if (resolvedChild.type === "array" && !newRecord[key]) {
      newRecord[key] = [];
    }
  });

  console.log("Store before upsert:", store.value);
  store.value.upsertEntity(props.collectionKey, newRecord, contextData.value.parentContext);
  isModalOpen.value = false;
}
</script>
