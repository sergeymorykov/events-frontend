import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@shared/api/authApi';
import { userApi } from '@shared/api/userApi';
import type { UserResponse, UserLogin, UserRegister } from '@shared/types';
import { useEventActionsStore } from './useEventActionsStore';

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (data: UserRegister) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearSession: () => void;
}

const TOKEN_KEY = 'token';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (credentials: UserLogin) => {
        const response = await authApi.login(credentials);
        localStorage.setItem(TOKEN_KEY, response.token);
        set({ token: response.token, user: response.user });
      },

      register: async (data: UserRegister) => {
        const response = await authApi.register(data);
        localStorage.setItem(TOKEN_KEY, response.token);
        set({ token: response.token, user: response.user });
      },

      clearSession: () => {
        localStorage.removeItem(TOKEN_KEY);
        useEventActionsStore.getState().reset();
        set({ token: null, user: null });
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        useEventActionsStore.getState().reset();
        set({ token: null, user: null });
      },

      loadUser: async () => {
        // This will be called on app initialization if token exists
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          set({ token: null, user: null });
          return;
        }
        
        try {
          const user = await userApi.getCurrentUser();
          set({ token, user });
        } catch {
          set({ token: null, user: null });
          localStorage.removeItem(TOKEN_KEY);
          useEventActionsStore.getState().reset();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

