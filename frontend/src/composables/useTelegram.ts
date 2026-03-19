import WebApp from '@twa-dev/sdk';
import { computed } from 'vue';

export function useTelegram() {
  const isInTelegram = computed(() => {
    return Boolean(window.Telegram?.WebApp?.initData);
  });

  const telegramUser = computed(() => {
    return WebApp.initDataUnsafe?.user ?? null;
  });

  const init = () => {
    if (!isInTelegram.value) return;
    WebApp.ready();
    WebApp.expand();

    document.documentElement.style.removeProperty('--tg-theme-bg-color');
    document.documentElement.style.removeProperty('--tg-theme-text-color');
    document.documentElement.style.removeProperty('--tg-theme-hint-color');
    document.documentElement.style.removeProperty('--tg-theme-link-color');
    document.documentElement.style.removeProperty('--tg-theme-button-color');
    document.documentElement.style.removeProperty('--tg-theme-button-text-color');
    document.documentElement.style.removeProperty('--tg-theme-secondary-bg-color');

    document.documentElement.setAttribute('style',
      'background-color: #ffffff !important; color-scheme: light !important;'
    );
  };

  const showMainButton = (text: string, onClick: () => void) => {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.onClick(onClick);
    WebApp.MainButton.show();
  };

  const hideMainButton = () => WebApp.MainButton.hide();

  const haptic = (type: 'success' | 'error' | 'warning') => {
    WebApp.HapticFeedback.notificationOccurred(type);
  };

  const close = () => WebApp.close();

  return {
    isInTelegram,
    telegramUser,
    init,
    showMainButton,
    hideMainButton,
    haptic,
    close,
  };
}
