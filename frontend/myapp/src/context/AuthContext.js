import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setAuthToken(token);
      try {
        setUser(jwtDecode(token));
      } catch (error) {
        console.error("Failed to decode token", error);
        setToken(null); 
      }
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('https://yard-stick-notes-app.vercel.app/auth/login', {
      email,
      password,
    });
    setToken(res.data.token);
  };
  const updateUser = (newUserData) => {
    setUser(currentUser => ({
      ...currentUser,
      ...newUserData
    }));
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setToken,updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};