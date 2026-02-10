import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser && storedUser !== "undefined") {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading auth from localStorage:", error);
      // Clear invalid data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    // Store token and user data
    const { token: authToken, admin } = result.data;
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(admin));

    setToken(authToken);
    setUser(admin);

    return result;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("auth-change"));
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
