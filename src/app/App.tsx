import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from './providers/RouterProvider';
import { useAuthStore } from './store/useAuthStore';
import './index.css';

const App = () => {
  const loadUser = useAuthStore((state) => state.loadUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    // Load user data on app initialization if token exists
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    }
  }, [loadUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [clearSession]);

  return (
    <>
      <RouterProvider />
      <Toaster position="top-right" />
    </>
  );
};

export default App;

