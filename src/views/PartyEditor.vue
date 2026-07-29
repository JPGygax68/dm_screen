<template lang="pug">
  ion-page
    ion-header
      Breadcrumbs

    ion-content
      form
        ion-list
          //- Header row with an aligned inline add button
          ion-item(lines="none" slot="header")
            ion-label
              h2(style="font-weight: bold;") Party Members
            ion-button(slot="end" fill="solid" @click="addCharacter")
              ion-icon(slot="start" name="person-add")
              | Add Member

          //- Character List
          ion-list(aria-label="Party Members List")
            //- If list is empty
            ion-item(v-if="party.length === 0" lines="none")
              ion-label(color="medium" class="ion-text-center") No characters added to this party yet.

            //- Sliding items for swift tablet gestures
            ion-item-sliding(v-for="pc in party" :key="pc.id")
              ion-item
                ion-avatar(slot="start" class="ion-margin-end")
                  div(class="avatar-placeholder") {{ pc.name.charAt(0).toUpperCase() || 'P' }}
                ion-label
                  h3 {{ pc.name }}
                  p(v-if="pc.characterClass") {{ pc.characterClass }}
                  p(v-else color="medium") No class assigned

              //- Swipe Actions (Tablet UX)
              ion-item-options(side="end")
                ion-item-option(color="danger" @click="removeCharacter(pc.id)")
                  ion-icon(slot="icon-only" name="trash")

</template>
<style scoped lang="scss">
  .avatar-placeholder {
    background: var(--ion-color-step-200, #e0e0e0);
    color: var(--ion-color-dark);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border-radius: 50%;
  }
</style>

<script setup lang="ts">
  import { ref } from 'vue';
  import { onIonViewWillEnter } from '@ionic/vue';
  import { IonPage, IonHeader, IonContent, IonItem, IonLabel, IonButton, IonIcon, IonList, IonItemSliding, 
    IonItemOptions, IonItemOption, IonAvatar } from '@ionic/vue';
  import { addIcons } from 'ionicons';
  import { personAddOutline, trashOutline } from 'ionicons/icons';
  import { useRouter, useRoute } from 'vue-router';
  import Breadcrumbs from '../components/Breadcrumbs.vue';
  import useDmScreenStore from '../stores/dataStore.ts';
  import useUiStore from '../stores/uiStore.ts';

  const store = useDmScreenStore();
  const ui = useUiStore();
  const router = useRouter();
  const route = useRoute();

  addIcons({
    'person-add': personAddOutline,
    'trash': trashOutline
  });

  // Grab the campaign id from the URL parameter
  const campaignId = route.params.id as string;

  const party = ref(ui.campaignDraft?.party ?? []);


  onIonViewWillEnter(() => {
    // Look up the existing campaign record inside your permanent data store
    const existingCampaign = store.campaigns.find(c => c.id === campaignId);
    console.assert(!!existingCampaign, `No campaign found with ID: ${campaignId}`);
    // Load a deep reactive copy into your UI store draft block to edit safely
    ui.loadCampaignIntoDraft(existingCampaign);
  });


  function addCharacter() {
    router.push(`/campaigns/${campaignId}/player-characters/new`);
  }

  function removeCharacter(characterId: string) {
    ui.removeCharacterFromParty(characterId);
    party.value = ui.campaignDraft?.party ?? []; // Update the local party reference
  }


</script>