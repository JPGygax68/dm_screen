

export async function focusIonicInput(input: any): Promise<HTMLInputElement | HTMLTextAreaElement | null> {

  const ionicElement = input?.$el!;
  const nativeInput = ionicElement.querySelector('input') || ionicElement.querySelector('textarea');
  if (!nativeInput) {
    console.warn('No native input found, cannot focus.');
    return null;
  }

  for (let attempts = 0; attempts < 10; attempts++) {
    nativeInput.focus();
    // Stop looping if the browser successfully assigns active document focus to it
    if (document.activeElement === nativeInput) {
      // console.log(`Focus attempt ${attempts} succeeded. Active element:`, document.activeElement);
      return nativeInput;
    }
    await new Promise(requestAnimationFrame); // Immediately try again on the very next browser frame paint
  }
  console.warn(`Focus attempt failed. Active element:`, document.activeElement);
  return null;
}

export function focusAndSelectIonicInput(input: any) {

  const ionicElement = input?.$el!;
  const nativeInput = ionicElement.querySelector('input') || ionicElement.querySelector('textarea');
  if (!nativeInput) {
    console.warn('No native input found, cannot focus.');
    return;
  }

  let attempts = 0;
  const tryFocus = () => {

    nativeInput.focus();
    nativeInput.select();

    // Stop looping if the browser successfully assigns active document focus to it
    if (document.activeElement === nativeInput) {
      // console.log(`Focus attempt ${attempts} succeeded. Active element:`, document.activeElement);
      return;
    }
    if (attempts >= 10) {
      console.warn(`Focus attempt ${attempts} failed. Active element:`, document.activeElement);
      return;
    }

    attempts++;
    requestAnimationFrame(tryFocus); // Immediately try again on the very next browser frame paint
  };

  tryFocus();
}