'use client';

import { apiGet } from '@/src/shared/config/api-client';
import { API_ENDPOINTS } from '@/src/shared/constants/api-endpoints';
import { useQuery } from '@tanstack/react-query';

type AiProvidersResponse = {
  providers: { name: string; model: string }[];
};

export function useAiProviders() {
  return useQuery({
    queryKey: ['ai', 'providers'],
    queryFn: () => apiGet<AiProvidersResponse>(API_ENDPOINTS.AI.PROVIDERS),
    staleTime: 1000 * 60 * 5,
  });
}
