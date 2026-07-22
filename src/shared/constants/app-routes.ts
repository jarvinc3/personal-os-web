export const APP_ROUTES = {
  root: '/',
  marketing: {
    landing: '/landing',
  },
  auth: {
    login: '/login',
    verifyEmail: '/verify-email',
    callback: '/auth/callback',
  },
  app: {
    home: '/home',
    settings: '/settings',
    chat: '/chat',
    notifications: '/notifications',
    keepAwake: '/keep-awake',
  },
} as const;

export function authVerifyEmailHref(email: string): string {
  const params = new URLSearchParams({ email });
  return `${APP_ROUTES.auth.verifyEmail}?${params.toString()}`;
}
