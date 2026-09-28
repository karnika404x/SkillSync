import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, checkBackendHealth, initialEmployees } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ss_token') || null);
  const [isBackendActive, setIsBackendActive] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    checkBackendHealth().then((active) => {
      setIsBackendActive(active);
    });
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const login = async (employeeId, password, role) => {
    const empIdUpper = employeeId.trim().toUpperCase();

    if (isBackendActive) {
      try {
        const data = await apiLogin(empIdUpper, password, role);
        setToken(data.access_token);
        localStorage.setItem('ss_token', data.access_token);
        setUser(data.user);
        triggerToast(`Welcome back, ${data.user.name}!`);
        return true;
      } catch (err) {
        throw new Error(err.message || 'Login failed');
      }
    }

    // Local fallback login
    if (password !== 'demo123') {
      throw new Error('Demo password is demo123.');
    }

    const found = initialEmployees.find((e) => e.id === empIdUpper) || initialEmployees[0];
    const userPayload = { ...found, role };
    setUser(userPayload);
    triggerToast(`Welcome back, ${found.name}!`);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ss_token');
    triggerToast('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, isBackendActive, login, logout, toastMessage, triggerToast }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
