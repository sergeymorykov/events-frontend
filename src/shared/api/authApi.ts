import api from './axios';
import type { AuthResponse, LoginResponse, UserLogin, UserRegister } from '../types';

export const authApi = {
  // ✅ Логин теперь только по nickname
  login: async (credentials: UserLogin): Promise<LoginResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    // Backend returns { access_token, token_type }, need to fetch user separately
    return {
      token: data.access_token,
      user: await getUserAfterAuth(data.access_token),
    };
  },

  // ✅ Регистрация с nickname вместо email/password
  register: async (userData: UserRegister): Promise<LoginResponse> => {
    // Step 1: Register user (nickname + name)
    await api.post('/auth/register', userData);
    
    // Step 2: Login with nickname
    const loginData = await api.post<AuthResponse>('/auth/login', {
      nickname: userData.nickname,
    });
    
    // Step 3: Get user data
    return {
      token: loginData.data.access_token,
      user: await getUserAfterAuth(loginData.data.access_token),
    };
  },
};

// Helper function to get user after authentication
async function getUserAfterAuth(token: string) {
  const response = await api.get('/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

