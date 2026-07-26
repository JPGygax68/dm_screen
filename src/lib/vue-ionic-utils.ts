
import { nextTick } from 'vue';

export async function focusIonicInput(input: any): Promise<HTMLInputElement | HTMLTextAreaElement | null> {

  console.assert(input, 'Input is null or undefined, cannot focus.');

  const ionicElement = input?.$el!;
  if (!ionicElement) {
    console.warn('No ionic element found for input', input, 'cannot focus.');
    return null;
  }

  for (let attempts = 0; attempts < 20; attempts++) {
    const nativeInput = ionicElement.querySelector('input') || ionicElement.querySelector('textarea');
    if (nativeInput) {
      nativeInput.focus();
      // Stop looping if the browser successfully assigns active document focus to it
      if (document.activeElement === nativeInput) {
        // console.log(`Focus attempt ${attempts} succeeded. Active element:`, document.activeElement);
        return nativeInput;
      }
    }
    await new Promise(requestAnimationFrame); // Immediately try again on the very next browser frame paint
  }
  
  console.warn(`Focus attempt failed. Active element:`, document.activeElement);
  return null;
}

export async function focusAndSelectIonicInput(input: any): Promise<void> {

  (await focusIonicInput(input))?.select();
}