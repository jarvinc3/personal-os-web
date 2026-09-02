import { API_BASE_URL } from '@/src/shared/constants/api-endpoints';

export function resolveNotificationsSocketUrl(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}
