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
        setToken(savedToken); // Set token immediately for faster UI
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Token invalid, clear it
            localStorage.removeItem("authToken");
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
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
        // Clean URL and let React Router handle navigation
        window.history.replaceState({}, document.title, "/");
      };
      handleCallback();
    } else if (isCallbackPath) {
      // If on callback path but no token, redirect to login
      window.history.replaceState({}, document.title, "/");
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

  const loginWithDemo = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const { token, user } = await res.json();
      setUser(user);
      setToken(token);
      localStorage.setItem("authToken", token);
    } catch (err) {
      console.error("Demo login failed:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, loginWithDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
