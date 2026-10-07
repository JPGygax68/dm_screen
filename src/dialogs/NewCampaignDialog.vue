<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from "vue";
import { useDataStore } from "../stores/data-store.ts";

const open = defineModel<boolean>("open", { default: false });
const emit = defineEmits<{ error: [message: string] }>();

const store = useDataStore();
const title = ref("");
const description = ref("");
const isSaving = ref(false);
const nameInput = ref<HTMLInputElement>();

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") close();
}

// Escape-to-close and background scroll lock only need to exist while open,
// so they're wired up here rather than as permanent global listeners.
watch(open, async (isOpen) => {
  document.body.classList.toggle("overflow-hidden", isOpen);
  if (isOpen) {
    document.addEventListener("keydown", handleKeydown);
    await nextTick();
    nameInput.value?.focus();
  } else {
    document.removeEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.classList.remove("overflow-hidden");
});

function close(): void {
  open.value = false;
  title.value = "";
  description.value = "";
}

async function createCampaign(): Promise<void> {
  if (!title.value.trim()) return;

  isSaving.value = true;
  try {
    const draftId = store.beginDraft("Campaign", {
      name: title.value.trim(),
      description: description.value.trim() || undefined
    });
    await store.commitDraft(draftId, "Campaign");
    close();
  } catch (error) {
    emit("error", error instanceof Error ? error.message : "Unable to create campaign.");
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-(--z-modal) flex items-center justify-center bg-ink/40 p-4"
      @click.self="close"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-campaign-title"
        class="w-full max-w-md border-t-4 border-copper bg-paper-deep p-6 shadow-[0_24px_48px_-24px_oklch(0.24_0.03_165)]"
      >
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-moss">New record</p>
        <h2 id="new-campaign-title" class="mt-2 font-display text-2xl">Start a campaign</h2>
        <form class="mt-6 grid gap-4" @submit.prevent="createCampaign">
          <label class="grid gap-2 text-sm font-bold" for="campaign-name">
            Name
            <input
              id="campaign-name"
              ref="nameInput"
              v-model="title"
              required
              class="border border-ink/20 bg-paper px-3 py-2 font-normal outline-none ring-moss/30 focus:ring-2"
              placeholder="The Sunken Keep"
            />
          </label>
          <label class="grid gap-2 text-sm font-bold" for="campaign-description">
            Description <span class="font-normal text-ink/50">optional</span>
            <textarea
              id="campaign-description"
              v-model="description"
              class="min-h-24 resize-y border border-ink/20 bg-paper px-3 py-2 font-normal outline-none ring-moss/30 focus:ring-2"
              placeholder="A short note about this world or arc."
            />
          </label>
          <div class="mt-2 flex justify-end gap-3">
            <button type="button" class="px-4 py-3 text-sm font-bold text-ink/70 transition hover:text-ink" @click="close">
              Cancel
            </button>
            <button
              type="submit"
              class="bg-moss-dark px-4 py-3 text-sm font-bold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSaving || !title.trim()"
            >
              {{ isSaving ? "Saving..." : "Create campaign" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
