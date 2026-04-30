"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, User, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductOpen, setIsMobileProductOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleCart, itemCount } = useCart();
  const { toggleAccountSidebar } = useAccount();
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await fetch(`/v1/products?adminId=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.status === "success" && data.data.products.length > 0) {
        const product = data.data.products[0];
        router.push(`/product/${product._id}`);
      } else {
        alert("No product found with that ID");
      }
    } catch (err) {
      console.error("Search failed:", err);
      alert("Search failed. Please try again.");
    }
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Mega menu structure
  const productMenu = {
    Clothes: ["Clothes","Men's wear", "Ladies wear", "Kids wear", "Top selling"],
    Other: ["Accessories", "Car enthusiast", "Car poster", "Photo frame", "Limited edition" , "Trending"],
  };

  return (
    <nav className="fixed top-4 left-0 right-0 mx-auto z-50 w-[95%] max-w-[1400px]">
      <div className="flex items-center justify-between px-3 py-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-black/5">
        
        {/* Left: Logo & Brand */}
        <div className="flex items-center pl-2">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <Image
              src="/logos.svg"
              alt="Radhewears Logo"
              width={32}
              height={32}
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="text-[1.1rem] md:text-xl font-bold tracking-tight text-[#1a1a1a]">
              Radhewears
            </span>
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#1a1a1a]">
          {/* Product Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsProductOpen(true)}
            onMouseLeave={() => setIsProductOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-[#4d61fc] transition-colors py-2">
              Product <ChevronDown className="w-4 h-4 ml-0.5 opacity-70" />
            </button>
            <AnimatePresence>
              {isProductOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-black/5 px-8 py-6 flex gap-16 cursor-default pointer-events-auto"
                >
                  {/* Column 1: Clothes */}
                  <div className="flex flex-col min-w-[120px]">
                    <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-5">
                      Clothes
                    </h3>
                    <div className="flex flex-col gap-4">
                      {productMenu.Clothes.map((item) => (
                        <Link
                          key={item}
                          href={`/products/${item.toLowerCase().replace(/ /g, "-").replace(/'/g, "")}`}
                          className="text-[15px] text-[#1a1a1a] hover:text-[#4d61fc] transition-colors whitespace-nowrap"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Other */}
                  <div className="flex flex-col min-w-[160px]">
                    <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-5">
                      Other
                    </h3>
                    <div className="flex flex-col gap-4">
                      {productMenu.Other.map((item) => (
                        <Link
                          key={item}
                          href={`/products/${item.toLowerCase().replace(/ /g, "-").replace(/'/g, "")}`}
                          className="text-[15px] text-[#1a1a1a] hover:text-[#4d61fc] transition-colors whitespace-nowrap"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/contact" className="hover:text-[#4d61fc] transition-colors py-2">
            Contact
          </Link>

          <Link href="/custom-design" className="hover:text-[#4d61fc] font-semibold hover:opacity-80 transition-opacity whitespace-nowrap py-2">
            Custom Design
          </Link>
        </div>

        {/* Right: Icon Pill & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-3 lg:gap-5 bg-black text-white rounded-full px-4 py-2 md:px-5 md:py-2.5 shadow-md">
            <button aria-label="Search" onClick={() => setIsSearchOpen(true)} className="hover:opacity-80 transition-opacity">
              <Search className="h-[16px] w-[16px] md:h-[18px] md:w-[18px] stroke-[2] cursor-pointer" />
            </button>
            <button
              aria-label="Shopping Cart"
              onClick={toggleCart}
              className="relative hover:opacity-80 transition-opacity"
            >
              <ShoppingCart className="h-[16px] w-[16px] md:h-[18px] md:w-[18px] stroke-[2] cursor-pointer" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#5c3cfa] rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button aria-label="User Account" onClick={toggleAccountSidebar} className="hover:opacity-80 transition-opacity">
              <User className="h-[16px] w-[16px] md:h-[18px] md:w-[18px] stroke-[2] cursor-pointer" />
            </button>
          </div>
          
          {/* Mobile Menu Toggle Button */}
          <button 
            aria-label="Toggle Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#1a1a1a] hover:opacity-70 transition-opacity"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 stroke-[1.5]" />
            ) : (
              <Menu className="h-6 w-6 stroke-[1.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden lg:hidden"
          >
            <div className="flex flex-col py-6 px-6 gap-6">
              
              {/* Mobile Product Accordion */}
              <div className="flex flex-col">
                <button 
                  onClick={() => setIsMobileProductOpen(!isMobileProductOpen)}
                  className="flex items-center justify-between text-[1.1rem] font-semibold text-[#1a1a1a] pb-2 border-b border-gray-100"
                >
                  Product
                  <motion.div animate={{ rotate: isMobileProductOpen ? 180 : 0 }}>
                    <ChevronDown className="w-5 h-5 opacity-70" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isMobileProductOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden flex flex-col gap-6 pt-4 pl-2"
                    >
                      {/* Mobile Clothes */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Clothes
                        </h4>
                        {productMenu.Clothes.map((item) => (
                          <Link
                            key={item}
                            href={`/products/${item.toLowerCase().replace(/ /g, "-").replace(/'/g, "")}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[#1a1a1a] hover:text-[#4d61fc] py-1"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                      
                      {/* Mobile Other */}
                      <div className="flex flex-col gap-3">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Other
                        </h4>
                        {productMenu.Other.map((item) => (
                          <Link
                            key={item}
                            href={`/products/${item.toLowerCase().replace(/ /g, "-").replace(/'/g, "")}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[#1a1a1a] hover:text-[#4d61fc] py-1"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                href="/contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[1.1rem] font-semibold text-[#1a1a1a] hover:text-[#4d61fc] pb-2 border-b border-gray-100"
              >
                Contact
              </Link>
              
              <Link 
                href="/custom-design" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[1.1rem] font-bold text-[#4d61fc] hover:opacity-80"
              >
                Custom Design
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Find Product by ID</h3>
              </div>
              <input
                type="text"
                placeholder="Enter product ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4d61fc] focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2 bg-[#4d61fc] text-white rounded-lg hover:bg-[#4d61fc]/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  );
}
