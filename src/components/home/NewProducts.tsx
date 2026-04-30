"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export function NewProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [loading, setLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/v1/products");
        const data = await res.json();
        if (data.status === "success") {
          setProducts(data.data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(2);
      else if (window.innerWidth < 1024) setItemsPerPage(3);
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

  // Reset to first page if resize changes totalPages and current page is out of bounds
  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(0);
  }, [totalPages, currentPage]);

  return (
    <section className="w-full bg-white py-24 md:py-32 px-6 md:px-[6%] relative z-10">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 md:mb-24 gap-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-2xl"
          >
            <motion.h2
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8 leading-[0.9]"
            >
              <span
                className="font-light text-transparent bg-clip-text stroke-text"
                style={{ WebkitTextStroke: "1px #1a1a1a", color: "transparent" }}
              >
                Radhewears
              </span>{" "}
              <br className="hidden md:block" />
              <span className="font-extrabold text-[#1a1a1a]">New Product</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-[#4a4a4a] text-lg md:text-xl font-medium leading-relaxed max-w-xl"
            >
              Try out our latest clothing collection made for comfort, style, and confidence. With
              premium fabric and a clean, modern look, it&apos;s perfect for everyday wear.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/collections/new"
              className="group flex items-center gap-2 text-sm md:text-base font-bold text-[#426df5] hover:text-[#2c4bc4] transition-colors uppercase tracking-widest"
            >
              more product
              <span className="p-1 rounded-full border border-[#426df5] group-hover:bg-[#426df5] group-hover:text-white transition-all">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        </div>        {/* Product Grid */}
        <motion.div
          key={`page-${currentPage}-${itemsPerPage}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 min-h-[400px]"
        >
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
              <motion.div
              key={product._id}
              variants={itemVariants}
              className="group flex flex-col cursor-pointer"
              onMouseEnter={() => setHoveredId(product._id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => router.push(`/product/${product._id}`)}
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] md:aspect-[4/5] w-full bg-[#f0f0f0] overflow-hidden">
                {/* Subtle overlay permanently visible */}
                <div className="absolute inset-0 bg-black/5 opacity-100 z-10" />

                {/* Image scale on hover */}
                <motion.div
                  className="w-full h-full bg-[#d5d2cd] overflow-hidden flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  )}
                </motion.div>

                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] md:text-xs font-bold text-red-500 tracking-wider">
                    {product.discount}% OFF
                  </div>
                )}

                {/* Action Buttons — Arrow + Cart (Always Visible) */}
                <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-30 hidden md:flex flex-col gap-2">
                  <div key="arrow">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/product/${product._id}`);
                      }}
                      className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-[#1a1a1a] rounded-full shadow-sm text-white hover:bg-black transition-colors duration-200"
                      aria-label="View product"
                    >
                      <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  <div key="cart">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 bg-[#1a1a1a] rounded-full shadow-sm text-white hover:bg-black transition-colors duration-200 cursor-pointer"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info Bar */}
              <div className="pt-3 md:pt-4 flex flex-col gap-0.5 md:gap-1">
                <h3 className="text-[13.5px] md:text-[15px] font-medium text-[#1a1a1a] leading-snug pr-2">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] md:text-[14px] text-[#555]">
                    ₹{product.discount > 0
                      ? (product.price * (1 - product.discount / 100)).toFixed(2)
                      : product.price.toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-[12px] md:text-[13px] text-gray-400 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-16 md:mt-24">
          <button
            onClick={prevPage}
            disabled={totalPages <= 1}
            className={`flex items-center justify-center w-12 h-12 rounded-full border-[1.5px] ${
              totalPages <= 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
            } transition-colors`}
            aria-label="Previous page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`rounded-full transition-all duration-300 ${
                  currentPage === idx
                    ? "w-10 h-3 bg-[#1a1a1a]"
                    : "w-3 h-3 bg-[#888] hover:bg-[#555]"
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={totalPages <= 1}
            className={`flex items-center justify-center w-12 h-12 rounded-full border-[1.5px] ${
              totalPages <= 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
            } transition-colors`}
            aria-label="Next page"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
