"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartSidebar } from "@/components/layout/CartSidebar";
import { AccountProvider } from "@/context/AccountContext";
import { AccountSidebar } from "@/components/layout/AccountSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/radhewearsadminpage13");
  const isCheckoutPage = pathname === "/checkout";

  return (
    <CartProvider>
      <AccountProvider>
        {!isAdminPage && !isCheckoutPage && <Navbar />}
        {!isAdminPage && <CartSidebar />}
        {!isAdminPage && <AccountSidebar />}
        {children}
        {!isAdminPage && !isCheckoutPage && <Footer />}
      </AccountProvider>
    </CartProvider>
  );
}
