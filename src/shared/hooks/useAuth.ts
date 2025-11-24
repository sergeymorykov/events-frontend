import { useAuthStore } from '@app/store/useAuthStore';

export const useAuth = () => {
  const { token, user, login, register, logout, loadUser } = useAuthStore();
  return {
    isAuthenticated: !!token,
    user,
    token,
    login,
    register,
    logout,
    loadUser,
  };
};

