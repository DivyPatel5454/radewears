"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { CartItem } from "@/context/CartContext";

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  cart?: CartItem[] | unknown[];
  purchaseHistory?: string[];
}

interface LoginResponse {
  data?: {
    user?: UserProfile;
    token?: string;
  };
}

interface AccountContextType {
  isAccountSidebarOpen: boolean;
  openAccountSidebar: () => void;
  closeAccountSidebar: () => void;
  toggleAccountSidebar: () => void;
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  signIn: (idToken: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [isAccountSidebarOpen, setIsAccountSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const openAccountSidebar = useCallback(() => setIsAccountSidebarOpen(true), []);
  const closeAccountSidebar = useCallback(() => setIsAccountSidebarOpen(false), []);
  const toggleAccountSidebar = useCallback(() => setIsAccountSidebarOpen((prev) => !prev), []);

  const setSession = (user: UserProfile | null, token: string | null) => {
    setUser(user);
    setToken(token);
    setIsAuthenticated(Boolean(user && token));
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setIsInitializing(false);
        return;
      }
      const res = await fetch('/v1/users/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (!res.ok) throw new Error('Profile refresh failed');
      const body = (await res.json()) as LoginResponse;
      if (body?.data?.user) {
        setSession(body.data.user, savedToken);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userCartSync', { detail: body.data.user.cart || [] }));
        }
      }
    } catch {
      setSession(null, null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const signIn = useCallback(async (idToken: string) => {
    const res = await fetch('/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      throw new Error('Google sign-in failed');
    }
    const body = (await res.json()) as LoginResponse;
    if (body?.data?.user && body?.data?.token) {
      setSession(body.data.user, body.data.token);
      // Load the cart from the server
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userCartSync', { detail: body.data.user.cart || [] }));
      }
    } else {
      throw new Error('Invalid user response from server');
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null, null);
    // Keep the cart in localStorage for guest users
    // Don't clear cart or dispatch empty cart
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleCartUpdated = (event: Event) => {
      if (!token || !isAuthenticated) return;
      const customEvent = event as CustomEvent<CartItem[]>;
      const cart = Array.isArray(customEvent.detail) ? customEvent.detail : [];

      const syncCart = async () => {
        try {
          await fetch('/v1/users/me/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ cart }),
          });
        } catch {
          // ignore sync failures for now
        }
      };

      syncCart();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', handleCartUpdated as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cartUpdated', handleCartUpdated as EventListener);
      }
    };
  }, [token, isAuthenticated]);

  const value = useMemo(() => ({
    isAccountSidebarOpen,
    openAccountSidebar,
    closeAccountSidebar,
    toggleAccountSidebar,
    user,
    token,
    isAuthenticated,
    isInitializing,
    signIn,
    signOut,
    refreshUser,
  }), [isAccountSidebarOpen, openAccountSidebar, closeAccountSidebar, toggleAccountSidebar, user, token, isAuthenticated, isInitializing, signIn, signOut, refreshUser]);

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
