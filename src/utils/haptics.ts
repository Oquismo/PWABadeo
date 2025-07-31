// src/utils/haptics.ts
export const vibrate = (duration: number = 50) => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
};