import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';

interface AuthContextType {
  token: string | null;
  user: {
    id: number;
    username: string;
    phone_number: string;
  } | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cropwaygis_auth_token');
    }
    return null;
  });

  const [user, setUser] = useState<AuthContextType['user'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await apiFetch('/api/v1/auth/me/');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid or expired
          logout();
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = (newToken: string, userData: any) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cropwaygis_auth_token', newToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cropwaygis_auth_token');
    }
  };

  const checkAuthStatus = async () => {
    if (token) {
      try {
        const response = await apiFetch('/api/v1/auth/me/');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        logout();
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}