"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export function YouMayAlsoLike() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/v1/products");
        const data = await res.json();
        if (data.status === "success") {
          setProducts(data.data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      // Show 2 items on phone, 4 items on larger screens
      if (window.innerWidth < 768) setItemsPerPage(2);
      else setItemsPerPage(4);
    };
    
    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const visibleProducts = products.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  // Reset page if out of bounds after resize
  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(0);
  }, [totalPages, currentPage]);

  return (
    <section className="w-full bg-white py-16 md:py-24 px-6 md:px-[6%]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1a1a1a] tracking-tight">
            You may also like
          </h2>
          <Link 
            href="/collections/all" 
            className="hidden md:flex items-center gap-1.5 text-base font-bold text-[#426df5] hover:opacity-80 transition-opacity"
          >
            View more
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 16 16 12 12 8"></polyline>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </Link>
        </div>

        {/* Mobile View More Link (Show under header on mobile or keep inline) */}
        <Link 
          href="/collections/all" 
          className="md:hidden flex items-center justify-end gap-1.5 text-sm font-bold text-[#426df5] hover:opacity-80 transition-opacity mb-6 -mt-2"
        >
          View more
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 16 16 12 12 8"></polyline>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </Link>

        {/* Grid matching the Home Page style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col animate-pulse">
                <div className="relative aspect-[3/4] md:aspect-[4/5] w-full bg-gray-200"></div>
                <div className="pt-3 md:pt-4 flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                </div>
              </div>
            ))
          ) : visibleProducts.map((product) => (
            <Link href={`/product/${product._id}`} key={product._id} className="group flex flex-col cursor-pointer">
              
              {/* Image Container */}
              <div className="relative aspect-[3/4] md:aspect-[4/5] w-full bg-[#e8e4db] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-black/5 opacity-0 md:group-hover:opacity-100 transition-opacity duration-400 z-10" />
                <div className="w-full h-full bg-[#d5d2cd] transform group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center overflow-hidden">
                   {product.images?.[0] && (
                     <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                   )}
                </div>
              </div>

              {/* Product Info Bar */}
              <div className="pt-3 md:pt-4 flex flex-col gap-0.5 md:gap-1">
                <h3 className="text-[13.5px] md:text-[15px] font-medium text-[#1a1a1a] leading-snug pr-2">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] md:text-[14px] text-[#555]">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-[12px] md:text-[13px] text-gray-400 line-through">
                      ₹{((product.price * 100) / (100 - product.discount)).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

            </Link>
          ))}
        </div>

        {/* Carousel Arrows */}
        <div className="flex items-center justify-center gap-20 md:gap-32 mt-12 md:mt-16">
          <button 
            onClick={prevPage}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            aria-label="Previous Page"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[2]" />
          </button>
          
          <button 
            onClick={nextPage}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            aria-label="Next Page"
          >
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 stroke-[2]" />
          </button>
        </div>

      </div>
    </section>
  );
}
