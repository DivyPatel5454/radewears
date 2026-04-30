"use client";

import { X, User, LogOut } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Script from 'next/script';
import { useAccount } from "@/context/AccountContext";

export function AccountSidebar() {
  const { isAccountSidebarOpen, closeAccountSidebar, user, isAuthenticated, signIn, signOut } = useAccount();
  const sdkInitialized = useRef(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Lock background scroll when sidebar is open
  useEffect(() => {
    if (isAccountSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAccountSidebarOpen]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isAccountSidebarOpen || !googleLoaded) return;

    type GoogleId = {
      initialize: (config: { client_id: string; callback: (response: { credential?: string }) => Promise<void>; ux_mode: string }) => void;
      renderButton: (container: HTMLElement | null, options: { theme: string; size: string }) => void;
    };

    const googleObject = (window as unknown as { google?: { accounts?: { id?: GoogleId } } }).google;
    if (!googleObject?.accounts?.id) return;

    const callback = async (response: { credential?: string }) => {
      if (response?.credential) {
        try {
          await signIn(response.credential);
        } catch (err) {
          console.error('Google sign-in failed', err);
        }
      }
    };

    if (!sdkInitialized.current) {
      googleObject.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback,
        ux_mode: 'popup',
      });
      sdkInitialized.current = true;
    }

    const buttonContainer = document.getElementById('google-signin-button');
    if (buttonContainer) {
      buttonContainer.innerHTML = '';
      googleObject.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
      });
    }
  }, [signIn, isAccountSidebarOpen, googleLoaded]);

  return (
    <>
      <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => setGoogleLoaded(true)}
      onError={(err) => {
        console.error('Google Sign-In SDK failed to load', err);
      }}
    />
      <AnimatePresence>
        {isAccountSidebarOpen && (
          <>
            {/* Backdrop */}
          <motion.div
            key="account-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={closeAccountSidebar}
          />

          {/* Sidebar Panel */}
          <motion.div
            key="account-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Account</h2>
              </div>
              <button
                onClick={closeAccountSidebar}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close account sidebar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-lg font-semibold text-gray-800">Welcome back</p>
                    <p className="text-sm text-gray-400 text-center">
                      Login with Google to save your cart, orders and purchase history.
                    </p>
                  </div>

                  <div id="google-signin-button" className="w-full" />

                  <p className="text-center text-sm text-gray-500">
                    Google login is the only login method supported for secure accounts.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
                      <div className="w-12 h-12 rounded-full bg-[#5c3cfa] text-white flex items-center justify-center flex-shrink-0 text-xl font-semibold">
                        {user?.name ? user.name.trim().charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user?.name || 'My Account'}</p>
                        <p className="text-xs text-gray-400">{user?.email || 'Signed in'}</p>
                      </div>
                    </div>

                    <Link
                      href="/account/orders"
                      onClick={closeAccountSidebar}
                      className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
                    >
                      View order history
                    </Link>

                    <div className="border-t border-gray-100 pt-4 mt-auto">
                      <button
                        onClick={() => {
                          signOut();
                          closeAccountSidebar();
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium text-red-500 cursor-pointer w-full text-left"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
