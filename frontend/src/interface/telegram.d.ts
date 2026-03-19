interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
  }
  colorScheme: 'light' | 'dark'
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    setText: (text: string) => void
    onClick: (fn: () => void) => void
    show: () => void
    hide: () => void
  }
  HapticFeedback: {
    notificationOccurred: (type: 'success' | 'error' | 'warning') => void
  }
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}
