import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Custom hook that wraps the auth context
export const useAuth = () => {
  const auth = useAuthContext();
  
  // Additional convenience methods can be added here
  const hasRole = (role) => {
    return auth.user?.role === role;
  };

  const canAccess = (resource) => {
    // Define access control logic here
    switch (resource) {
      case 'admin':
        return auth.isAdmin;
      case 'policies':
        return auth.isAuthenticated;
      case 'analytics':
        return auth.isAuthenticated;
      case 'chat':
        return auth.isAuthenticated;
      default:
        return auth.isAuthenticated;
    }
  };

  return {
    ...auth,
    hasRole,
    canAccess,
  };
};

export default useAuth;
