<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { classes } from "@/lib/dnd2024/classFeatures.ts";
import { species } from "@/lib/dnd2024/species.ts";
import { useDataStore } from "@/stores/data-store.ts";
import type { Campaign } from "@/types/campaign.ts";

const route = useRoute();
const router = useRouter();
const store = useDataStore();
const { roots } = storeToRefs(store);
const name = ref("");
const classId = ref("");
const speciesId = ref("");
const gender = ref("");
const isSaving = ref(false);
const errorMessage = ref("");
const draftId = ref<string>();
const nameInput = useTemplateRef<HTMLInputElement>("nameInput");

const campaign = computed(() => {
  const campaignId = route.params.campaignId;
  if (typeof campaignId !== "string") return undefined;
  return ((roots.value.campaigns ?? []) as Campaign[]).find((item) => item.id === campaignId);
});

const isFormComplete = computed(() =>
  Boolean(name.value.trim() && classId.value && speciesId.value && gender.value.trim()),
);

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") void close();
}

onMounted(async () => {
  document.body.classList.add("overflow-hidden");
  document.addEventListener("keydown", handleKeydown);
  await nextTick();
  nameInput.value?.focus();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.classList.remove("overflow-hidden");
  if (draftId.value) store.cancelDraft(draftId.value);
});

async function close(): Promise<void> {
  await router.push({ name: "campaign-detail", params: { campaignId: route.params.campaignId } });
}

async function createPlayerCharacter(): Promise<void> {
  if (!campaign.value || !isFormComplete.value || isSaving.value) return;

  isSaving.value = true;
  errorMessage.value = "";
  try {
    if (!draftId.value) draftId.value = store.beginDraft("PlayerCharacter");
    store.updateDraft(draftId.value, {
      name: name.value.trim(),
      classes: [classId.value],
      species: speciesId.value,
      gender: gender.value.trim(),
    });

    await store.commitDraft(draftId.value, "PlayerCharacter", {
      type: "Campaign",
      id: campaign.value.id,
      field: "party",
      collection: campaign.value.party,
    });
    draftId.value = undefined;
    await close();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to add player character.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-(--z-modal) flex items-center justify-center overflow-y-auto bg-ink/55 p-3 sm:p-6" @click.self="close">
      <section
        class="relative w-full max-w-xl border-t-4 border-copper bg-paper-deep p-5 shadow-[0_24px_48px_-24px_oklch(0.24_0.03_165)] sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-player-character-title"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-moss">Party member</p>
            <h2 id="new-player-character-title" class="mt-2 font-display text-2xl">New player character</h2>
          </div>
          <button type="button" class="px-3 py-2 text-sm font-bold text-ink/70 hover:text-ink" aria-label="Close dialog" @click="close">
            Close
          </button>
        </div>

        <form class="mt-6 grid gap-4 sm:grid-cols-2" @submit.prevent="createPlayerCharacter">
          <label class="grid gap-2 text-sm font-bold sm:col-span-2" for="player-character-name">
            Name
            <input
              id="player-character-name"
              ref="nameInput"
              v-model="name"
              required
              minlength="1"
              autocomplete="off"
              class="border border-ink/20 bg-paper px-3 py-3 font-normal outline-none ring-moss/30 focus:ring-2"
              placeholder="Elandra Brightwood"
            />
          </label>

          <label class="grid gap-2 text-sm font-bold" for="player-character-class">
            Class
            <select id="player-character-class" v-model="classId" required class="border border-ink/20 bg-paper px-3 py-3 font-normal outline-none ring-moss/30 focus:ring-2">
              <option disabled value="">Select class</option>
              <option v-for="classItem in classes" :key="classItem.id" :value="classItem.id">
                {{ classItem.name }}
              </option>
            </select>
          </label>

          <label class="grid gap-2 text-sm font-bold" for="player-character-species">
            Species
            <select id="player-character-species" v-model="speciesId" required class="border border-ink/20 bg-paper px-3 py-3 font-normal outline-none ring-moss/30 focus:ring-2">
              <option disabled value="">Select species</option>
              <option v-for="speciesItem in species" :key="speciesItem.id" :value="speciesItem.id">
                {{ speciesItem.name }}
              </option>
            </select>
          </label>

          <label class="grid gap-2 text-sm font-bold sm:col-span-2" for="player-character-gender">
            Gender
            <input
              id="player-character-gender"
              v-model="gender"
              list="player-character-gender-options"
              required
              minlength="1"
              autocomplete="off"
              class="border border-ink/20 bg-paper px-3 py-3 font-normal outline-none ring-moss/30 focus:ring-2"
              placeholder="Choose or enter a gender"
            />
            <datalist id="player-character-gender-options">
              <option value="male" />
              <option value="female" />
            </datalist>
          </label>

          <p v-if="errorMessage" class="text-sm text-red-700 sm:col-span-2" role="alert">{{ errorMessage }}</p>

          <div class="flex justify-end gap-3 sm:col-span-2">
            <button type="button" class="px-4 py-3 text-sm font-bold text-ink/70 transition hover:text-ink" @click="close">
              Cancel
            </button>
            <button
              type="submit"
              class="bg-moss-dark px-4 py-3 text-sm font-bold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isSaving || !isFormComplete"
            >
              {{ isSaving ? "Adding..." : "Add to party" }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>
