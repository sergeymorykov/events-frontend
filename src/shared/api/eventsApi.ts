import api from './axios';
import type { EventResponse, EventFilters, PaginatedEventsResponse } from '../types';

export const eventsApi = {
  getEvents: async (filters?: EventFilters, cursor?: string): Promise<PaginatedEventsResponse> => {
    // Build params manually to handle multiple category values
    const params = new URLSearchParams();
    
    if (filters) {
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
    
    const { data } = await api.get<PaginatedEventsResponse>('/events', { params });
    return data;
  },

  getEvent: async (id: string): Promise<EventResponse> => {
    const { data } = await api.get<EventResponse>(`/events/${id}`);
    return data;
  },

  likeEvent: async (id: string): Promise<void> => {
    await api.post(`/events/${id}/like`);
  },

  unlikeEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}/like`);
  },

  dislikeEvent: async (id: string): Promise<void> => {
    await api.post(`/events/${id}/dislike`);
  },

  undislikeEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}/dislike`);
  },

  participateEvent: async (id: string): Promise<void> => {
    await api.post(`/events/${id}/participate`);
  },

  cancelParticipation: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}/participate`);
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/categories');
    return data;
  },
};

