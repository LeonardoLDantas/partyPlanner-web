export async function registerPwa() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const { registerSW } = await import('virtual:pwa-register');
  registerSW({ immediate: true });
}
