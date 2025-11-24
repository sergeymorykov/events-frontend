import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from './providers/RouterProvider';
import { useAuthStore } from './store/useAuthStore';
import './index.css';

const App = () => {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    // Load user data on app initialization if token exists
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    }
  }, [loadUser]);

  return (
    <>
      <RouterProvider />
      <Toaster position="top-right" />
    </>
  );
};

export default App;

