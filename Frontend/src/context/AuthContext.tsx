import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as jwtDecode from 'jwt-decode';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  employeeId?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  setUserFromStorage: (user: User | null, token?: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize from localStorage token/user
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      if (token && userJson) {
        const parsed = JSON.parse(userJson);
        setUser(parsed);
      } else if (token) {
        // try decode token for basic user info
        const decoded: any = (jwtDecode as any)(token);
        setUser({
          id: decoded.user_id || decoded.user_id || '',
          username: decoded.username || '',
          email: decoded.email || '',
          role: decoded.role || 'user'
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth init error', err);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const setUserFromStorage = (userObj: User | null, token?: string) => {
    if (token) localStorage.setItem('token', token);
    if (userObj) localStorage.setItem('user', JSON.stringify(userObj));
    else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUser(userObj);
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, setUserFromStorage }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
