import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Radhewears",
  description: "Get yourself into the right gear with Radhewears.",
};

import ClientLayout from "@/components/layout/ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} font-sans h-full antialiased bg-[#e8e4d9] overflow-x-clip`}>
      <body className="min-h-full flex flex-col overflow-x-clip relative">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
