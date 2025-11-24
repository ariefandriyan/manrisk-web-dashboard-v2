import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  jabatan: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: string[];
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, permissions: string[], roles: string[]) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load auth data from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedPermissions = localStorage.getItem('permissions');
    const storedRoles = localStorage.getItem('roles');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
      setRoles(storedRoles ? JSON.parse(storedRoles) : []);
      setIsAuthenticated(true);
    }
    
    // Mark loading as complete
    setIsLoading(false);
  }, []);

  const login = (token: string, user: User, permissions: string[], roles: string[]) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('permissions', JSON.stringify(permissions));
    localStorage.setItem('roles', JSON.stringify(roles));

    setToken(token);
    setUser(user);
    setPermissions(permissions);
    setRoles(roles);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('roles');

    setToken(null);
    setUser(null);
    setPermissions([]);
    setRoles([]);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        roles,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
