"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { YouMayAlsoLike } from "@/components/products/YouMayAlsoLike";

import { useState, useEffect } from "react";

export default function CategoryPage() {
  const params = useParams();
  const categoryStr = typeof params?.category === 'string' ? params.category : 'Collection';
  const title = categoryStr.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  const categoryMap: { [key: string]: string } = {
    "clothes": "Clothes",
    "mens-wear": "Men's wear",
    "ladies-wear": "Ladies wear",
    "kids-wear": "Kids wear",
    "top-selling": "Top selling",
    "accessories": "Accessories",
    "car-enthusiast": "Car enthusiast",
    "car-poster": "Car poster",
    "photo-frame": "Photo frame",
    "limited-edition": "Limited edition",
    "trending": "Trending"
  };
  const exactCategory = categoryMap[categoryStr] || title;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/v1/products?category=" + encodeURIComponent(exactCategory));
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
  }, [exactCategory]);

  return (
    <main className="flex-grow bg-white min-h-screen">
      <div className="pt-32 pb-16 md:pb-24 px-6 md:px-[6%]">
        <div className="max-w-[1400px] mx-auto">
        
        {/* Dynamic Header based on the URL */}
        <div className="mb-10 md:mb-12 border-b border-gray-100 pb-6">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a1a1a] capitalize tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-500 font-medium">
            Explore our curated selection of {categoryStr}.
          </p>
        </div>

        {/* Product Grid matching the Home Page style */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col animate-pulse">
                <div className="relative aspect-[3/4] md:aspect-[4/5] w-full bg-gray-200"></div>
                <div className="pt-3 md:pt-4 flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
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

            </Link>
          ))) : (
            <div className="col-span-full py-10 text-center text-gray-500">No products found in this category.</div>
          )}
        </div>
        </div>
      </div>
      <YouMayAlsoLike />
    </main>
  );
}
