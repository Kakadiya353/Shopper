import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    // If no token or user data, set authenticated state to false
    if (!token || !userData) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    try {
      const parsedUserData = JSON.parse(userData);
      setIsAuthenticated(true);
      setUser(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = (token, userData) => {
    if (!token || !userData) {
      console.error('Login failed - missing token or user data');
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    console.log('AuthProvider logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    console.log('AuthProvider - Logout successful, isAuthenticated:', false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
