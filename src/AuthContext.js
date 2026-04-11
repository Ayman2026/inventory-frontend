import React, { createContext, useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem("authToken");
      if (savedToken) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setToken(savedToken);
          } else {
            localStorage.removeItem("authToken");
          }
        } catch (err) {
          localStorage.removeItem("authToken");
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  // Handle OAuth callback from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get("token");
    const isCallbackPath = window.location.pathname === "/auth/callback";
    
    if (callbackToken) {
      const handleCallback = async () => {
        await handleTokenLogin(callbackToken);
        // Redirect to root after successful login
        window.location.href = "/";
      };
      handleCallback();
    } else if (isCallbackPath) {
      // If on callback path but no token, redirect to login
      window.location.href = "/";
    }
  }, []);

  const handleTokenLogin = async (jwtToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("authToken", jwtToken);
      }
    } catch (err) {
      console.error("Token login failed:", err);
    }
  };

  const loginWithGoogle = async () => {
    const res = await fetch(`${API_URL}/auth/google`);
    const { url } = await res.json();
    window.location.href = url;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
