<template>
  <div class="pt-4 pb-2 w-full">
    <div class="relative flex w-full aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-design-border-default bg-component-list-item-subtle-bg" @click="triggerFilePicker">
      <img v-if="imageDataUrl" :src="imageDataUrl" class="h-full w-full object-cover" alt="Portrait preview" />
      <div v-else class="text-3xl text-design-page-muted" aria-hidden="true">👤</div>
      <div class="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] font-medium text-white">
        {{ imageDataUrl ? 'EDIT' : 'ADD' }}
      </div>
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