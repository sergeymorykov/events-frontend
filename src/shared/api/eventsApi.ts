import api from './axios';
import type { EventItem, EventFilters, PaginatedEventsResponse } from '../types';

interface RequestOptions {
  signal?: AbortSignal;
}

export const eventsApi = {
  getEvents: async (
    filters?: EventFilters,
    cursor?: string,
    options?: RequestOptions
  ): Promise<PaginatedEventsResponse> => {
    // Build params manually to handle multiple category values
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.categories  && filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append('categories', cat));
      }
      if (filters.min_price !== undefined) {
        params.append('min_price', filters.min_price.toString());
      }
      if (filters.max_price !== undefined) {
        params.append('max_price', filters.max_price.toString());
      }
      if (filters.date_from) {
        params.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        params.append('date_to', filters.date_to);
      }
      if (filters.for_my_interests) {
        params.append('for_my_interests', 'true');
      }
      if (filters.limit !== undefined) {
        params.append('limit', filters.limit.toString());
      }
    }
    
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const { data } = await api.get<PaginatedEventsResponse>('/events', { params, signal: options?.signal });
    return data;
  },

  getEvent: async (id: string, options?: RequestOptions): Promise<EventItem> => {
    const { data } = await api.get<EventItem>(`/events/${id}`, { signal: options?.signal });
    return data;
  },

  likeEvent: async (id: string, options?: RequestOptions): Promise<void> => {
    await api.post(`/events/${id}/like`, undefined, { signal: options?.signal });
  },

  unlikeEvent: async (id: string, options?: RequestOptions): Promise<void> => {
    await api.delete(`/events/${id}/like`, { signal: options?.signal });
  },

  dislikeEvent: async (id: string, options?: RequestOptions): Promise<void> => {
    await api.post(`/events/${id}/dislike`, undefined, { signal: options?.signal });
  },

  undislikeEvent: async (id: string, options?: RequestOptions): Promise<void> => {
    await api.delete(`/events/${id}/dislike`, { signal: options?.signal });
  },

  participateEvent: async (id: string, options?: RequestOptions): Promise<void> => {
    await api.post(`/events/${id}/participate`, undefined, { signal: options?.signal });
  },

  cancelParticipation: async (id: string, options?: RequestOptions): Promise<void> => {
    await api.delete(`/events/${id}/participate`, { signal: options?.signal });
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/categories');
    return data;
  },
};

