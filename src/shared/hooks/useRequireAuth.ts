import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      action();
    },
    [isAuthenticated, navigate]
  );

  return { isAuthenticated, requireAuth };
};
