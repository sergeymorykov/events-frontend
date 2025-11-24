import api from './axios';
import type { UserResponse } from '../types';

export const userApi = {
  getCurrentUser: async (): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>('/me');
    return data;
  },
};

