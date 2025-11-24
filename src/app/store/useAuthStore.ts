import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@shared/api/authApi';
import { userApi } from '@shared/api/userApi';
import type { UserResponse, UserLogin, UserRegister } from '@shared/types';

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (data: UserRegister) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (credentials: UserLogin) => {
        const response = await authApi.login(credentials);
        localStorage.setItem('token', response.token);
        set({ token: response.token, user: response.user });
      },

      register: async (data: UserRegister) => {
        const response = await authApi.register(data);
        localStorage.setItem('token', response.token);
        set({ token: response.token, user: response.user });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },

      loadUser: async () => {
        // This will be called on app initialization if token exists
        const token = localStorage.getItem('token');
        if (!token) {
          set({ token: null, user: null });
          return;
        }
        
        try {
          const user = await userApi.getCurrentUser();
          set({ token, user });
        } catch (error) {
          set({ token: null, user: null });
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

