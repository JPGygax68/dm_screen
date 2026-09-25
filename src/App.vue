<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useDataStore } from "./stores/data-store.ts";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  party?: unknown[];
  encounters?: unknown[];
}

const store = useDataStore();
const { roots } = storeToRefs(store);
const campaigns = computed(() => (roots.value.campaigns ?? []) as Campaign[]);
const title = ref("");
const description = ref("");
const isLoading = ref(true);
const isSaving = ref(false);
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

async function createCampaign(): Promise<void> {
  if (!title.value.trim()) return;

  isSaving.value = true;
  errorMessage.value = "";
  try {
    const draftId = store.beginDraft("Campaign", {
      name: title.value.trim(),
      description: description.value.trim() || undefined
    });
    await store.commitDraft(draftId, "Campaign");
    title.value = "";
    description.value = "";
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to create campaign.";
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <main class="min-h-dvh">
    <header class="border-b border-ink/10 bg-moss-dark text-paper">
      <div class="mx-auto flex max-w-6xl items-end justify-between gap-6 px-6 py-8 lg:px-10">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-copper">Dungeon Master workspace</p>
          <h1 class="mt-2 font-display text-4xl leading-tight sm:text-5xl">Campaigns</h1>
        </div>
        <span class="hidden rounded-full border border-paper/25 px-3 py-1 text-xs text-paper/75 sm:inline">Local archive</span>
      </div>
    </header>

    <div class="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-10">
      <section aria-labelledby="campaign-list-title">
        <div class="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
          <h2 id="campaign-list-title" class="font-display text-2xl">Your campaigns</h2>
          <span class="text-sm text-ink/60">{{ campaigns.length }} saved</span>
        </div>

        <p v-if="isLoading" class="py-10 text-ink/60">Opening your local archive...</p>
        <div v-else-if="campaigns.length" class="grid gap-3 pt-5">
          <article
            v-for="campaign in campaigns"
            :key="campaign.id"
            class="border border-ink/15 bg-white/55 p-5 shadow-[0_8px_24px_-18px_oklch(0.24_0.03_165)] transition hover:border-moss/60 hover:bg-white/80"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-display text-xl">{{ campaign.name }}</h3>
                <p v-if="campaign.description" class="mt-1 text-sm text-ink/65">{{ campaign.description }}</p>
              </div>
              <span class="text-xs uppercase tracking-[0.16em] text-moss">Draft</span>
            </div>
            <div class="mt-5 flex gap-5 text-xs text-ink/55">
              <span>{{ campaign.party?.length ?? 0 }} party members</span>
              <span>{{ campaign.encounters?.length ?? 0 }} encounters</span>
            </div>
          </article>
        </div>
        <div v-else class="border border-dashed border-ink/25 px-6 py-12 text-center">
          <p class="font-display text-xl">The table is clear.</p>
          <p class="mt-2 text-sm text-ink/60">Create your first campaign to begin preparing a session.</p>
        </div>
      </section>

      <aside class="self-start border-t-4 border-copper bg-paper-deep/65 p-6">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-moss">New record</p>
        <h2 class="mt-2 font-display text-2xl">Start a campaign</h2>
        <form class="mt-6 grid gap-4" @submit.prevent="createCampaign">
          <label class="grid gap-2 text-sm font-bold" for="campaign-name">
            Name
            <input id="campaign-name" v-model="title" required class="border border-ink/20 bg-paper px-3 py-2 font-normal outline-none ring-moss/30 focus:ring-2" placeholder="The Sunken Keep" />
          </label>
          <label class="grid gap-2 text-sm font-bold" for="campaign-description">
            Description <span class="font-normal text-ink/50">optional</span>
            <textarea id="campaign-description" v-model="description" class="min-h-24 resize-y border border-ink/20 bg-paper px-3 py-2 font-normal outline-none ring-moss/30 focus:ring-2" placeholder="A short note about this world or arc." />
          </label>
          <button class="mt-2 bg-moss-dark px-4 py-3 text-sm font-bold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50" :disabled="isSaving || !title.trim()">
            {{ isSaving ? "Saving..." : "Create campaign" }}
          </button>
        </form>
      </aside>
    </div>

    <p v-if="errorMessage" class="mx-auto max-w-6xl px-6 pb-8 text-sm text-red-700 lg:px-10" role="alert">{{ errorMessage }}</p>
  </main>
</template>