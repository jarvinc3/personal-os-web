export const APP_ROUTES = {
  root: '/home',
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
  },
} as const;

export function authVerifyEmailHref(email: string): string {
  const params = new URLSearchParams({ email });
  return `${APP_ROUTES.auth.verifyEmail}?${params.toString()}`;
}
