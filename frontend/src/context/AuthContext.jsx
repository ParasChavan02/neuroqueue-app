import { createContext, useContext, useEffect, useState } from 'react';

import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('neuroqueue_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('neuroqueue_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('neuroqueue_user');
    }
  }, [user]);

  const authenticate = async (path, payload) => {
    const response = await api.post(path, payload);
    localStorage.setItem('neuroqueue_token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem('neuroqueue_token');
    localStorage.removeItem('neuroqueue_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login: (payload) => authenticate('/auth/login', payload),
        register: (payload) => authenticate('/auth/register', payload),
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
