import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      if (!supabase) {
        return {
          success: false,
          error: "Supabase client is not initialised. Check your environment variables.",
        };
      }

      // Treat the username field as email for login
      const { data, error } = await supabase.rpc("admin_login", {
        p_email: username,
        p_password: password,
      });

      if (error) {
        return { success: false, error: error.message || "Login failed" };
      }

      const admin = Array.isArray(data) && data.length > 0 ? data[0] : null;

      if (!admin) {
        return { success: false, error: "Invalid email or password" };
      }

      // Create a simple client-side token for session state
      const token =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `supabase-admin-${Date.now()}`;

      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(admin));

      setUser(admin);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
