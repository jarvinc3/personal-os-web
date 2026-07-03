/** Rutas públicas de iconografía Personal OS (ver `public/assets/README.md`). */
export const appAssets = {
  iconLight: '/assets/icon-light.png',
  iconDark: '/assets/icon-dark.png',
  favicon96: '/assets/favicon-96x96.png',
  faviconIco: '/assets/favicon.ico',
  appleTouchIcon: '/assets/apple-touch-icon.png',
  welcomeIllustrationLight: '/assets/images/welcome-ilustration-light.png',
  welcomeIllustrationDark: '/assets/images/welcome-ilustration-dark.png',
} as const;

export function getAppIconPath(theme: 'light' | 'dark' | 'system' | undefined): string {
  if (theme === 'dark') {
    return appAssets.iconDark;
  }
  return appAssets.iconLight;
}

export function getWelcomeIllustrationPath(theme: 'light' | 'dark' | 'system' | undefined): string {
  if (theme === 'dark') {
    return appAssets.welcomeIllustrationDark;
  }
  return appAssets.welcomeIllustrationLight;
}
