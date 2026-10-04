import { ref, onMounted } from 'vue'

export function useDeviceType() {
  const isMobileOrTablet = ref(false);

  onMounted(() => {
    const isTouchOnly = window.matchMedia("(any-pointer: coarse) and (any-hover: none)").matches;
    const isMacIPad = navigator.maxTouchPoints > 1 && navigator.userAgent.includes("Macintosh");
    
    isMobileOrTablet.value = isTouchOnly || isMacIPad;
    console.log('isMobileOrTablet:', isMobileOrTablet.value);
  });

  return { isMobileOrTablet }
}