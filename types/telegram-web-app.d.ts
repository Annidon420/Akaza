interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
}

interface TelegramWebApp {
  themeParams: TelegramThemeParams;
  ready: () => void;
  expand: () => void;
  onEvent: (
    event: "themeChanged",
    callback: () => void
  ) => void;
  offEvent: (
    event: "themeChanged",
    callback: () => void
  ) => void;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}