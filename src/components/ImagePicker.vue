<template>
  <div style="padding-top: 16px; padding-bottom: 8px;">
    <div class="upload-container" @click="triggerFilePicker">
      <img v-if="imageDataUrl" :src="imageDataUrl" class="image-preview" alt="Portrait preview" />
      <div v-else class="placeholder-icon" aria-hidden="true">👤</div>
      <div class="edit-overlay">{{ imageDataUrl ? 'EDIT' : 'ADD' }}</div>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none;"
      @change="onImageSelected"
    />
  </div>
</template>

<style scoped lang="scss">

  .upload-container {
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 8px;
    border: 2px dashed var(--ion-color-step-300);
    background: var(--ion-color-step-50);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
  }

  .image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-icon {
    font-size: 28px;
    color: var(--ion-color-step-400);
  }

  /* Tiny overlay badge indicating the frame is clickable */
  .edit-overlay {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.6);
    color: #ffffff;
    font-size: 9px;
    text-align: center;
    padding: 2px 0;
    font-weight: 500;
  }
</style>

<script setup lang="ts">
  import { ref } from 'vue';

  const props = defineProps<{
    imageDataUrl: string;
  }>();

  const emit = defineEmits<{
    (e: 'change', value: string): void;
  }>();

  const fileInputRef = ref<HTMLInputElement | null>(null);

  function triggerFilePicker() {
    fileInputRef.value?.click();
  }

  function onImageSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => emit('change', e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  // FOR FUTURE USE: If you want to add a file size limit for uploads, you can uncomment and modify the following code:
  // function onPortraitSelected(event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   const file = target.files?.[0];
  //   if (!file) return;
  //   // Performance guard: Limit file size to 5MB for portrait uploads
  //   const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  //   if (file.size > maxSizeInBytes) {
  //     alert(`Selected file exceeds the 5MB limit. Please choose a smaller image.`);
  //     return;
  //   }

  //   // Convert the native file asset stream into a base64 data URL for immediate preview and storage
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     draft.value.portrait = reader.result as string;
  //     isDirty.value = true;
  //   };
  //   reader.readAsDataURL(file);
  //   console.log('Portrait file selected:', file.name, 'Size:', file.size, 'bytes');
  // }

</script>