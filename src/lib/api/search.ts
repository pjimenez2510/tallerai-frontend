import { apiClient } from './client';
import type { SearchResponse } from '@/types/search.types';

export const searchApi = {
  search(query: string) {
    return apiClient.get<SearchResponse>(
      `/search?q=${encodeURIComponent(query)}`,
    );
  },
};
