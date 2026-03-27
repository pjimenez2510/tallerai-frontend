'use client';

import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/search';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await searchApi.search(query);
      return response.data;
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
