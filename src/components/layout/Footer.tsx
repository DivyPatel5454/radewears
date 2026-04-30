"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0a0a] text-white pt-24 pb-12 px-6 md:px-[6%] relative z-10 overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-[#4d61fc]/50 to-transparent opacity-50" />
      
      <div className="max-w-[1400px] mx-auto flex flex-col gap-20">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8">
          
          {/* Brand & Newsletter */}
          <div className="flex flex-col gap-8 max-w-sm">
            <Link href="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="radhewears Logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-2xl font-black tracking-tighter uppercase">
                radhewears
              </span>
            </Link>
            <p className="text-[#a0a0a0] text-sm leading-relaxed">
              Premium clothing and lifestyle accessories designed for comfort, confidence, and enduring style.
            </p>
            
          </div>

          {/* Links Grid */}
          <div className="flex gap-12 sm:gap-24 lg:gap-32 flex-wrap">
            
            {/* Clothes */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[11px] font-bold text-[#6a6a6a] uppercase tracking-[0.2em]">Clothes</h4>
              <nav className="flex flex-col gap-3">
                {["Men's wear", "Ladies wear", "Kids wear", "Top selling"].map((item) => (
                  <Link 
                    key={item} 
                    href={`/products/${item.toLowerCase().replace(/ /g, "-").replace(/'/g, "")}`}
                    className="text-[#d0d0d0] text-sm hover:text-white transition-colors w-fit"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Other */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[11px] font-bold text-[#6a6a6a] uppercase tracking-[0.2em]">Other</h4>
              <nav className="flex flex-col gap-3">
                {["Accessories", "Car enthusiast", "Car poster", "Photo frame", "Limited edition", "Trending"].map((item) => (
                  <Link 
                    key={item} 
                    href={`/products/${item.toLowerCase().replace(/ /g, "-").replace(/'/g, "")}`}
                    className="text-[#d0d0d0] text-sm hover:text-white transition-colors w-fit"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[11px] font-bold text-[#6a6a6a] uppercase tracking-[0.2em]">Support</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/contact" className="text-[#d0d0d0] text-sm hover:text-white transition-colors w-fit">Contact Us</Link>
                <Link href="/custom-design" className="text-[#d0d0d0] text-sm hover:text-white transition-colors w-fit">Custom Design</Link>
              </nav>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#6a6a6a] text-xs font-medium">
            &copy; {currentYear} Radhewears. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-[#6a6a6a] text-xs font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
