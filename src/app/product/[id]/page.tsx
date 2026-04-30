"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { YouMayAlsoLike } from "@/components/products/YouMayAlsoLike";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");   // Default to match design
  const [selectedColor, setSelectedColor] = useState(0);    // 0: purple, 1: beige, 2: navy

  const colors = product?.colors?.length > 0 ? product.colors : [];
  const sizes = product?.sizes?.length > 0 ? product.sizes : [];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/v1/products/${id}`);
        const data = await res.json();
        if (data.status === "success") {
          const fetchedProduct = data.data.product;
          setProduct(fetchedProduct);
          if (fetchedProduct.sizes && fetchedProduct.sizes.length > 0) {
            setSelectedSize(fetchedProduct.sizes[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500">The product you are looking for does not exist.</p>
      </div>
    );
  }

  // Calculate discounted price
  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="min-h-screen bg-white">
      {/* Container need a max width and padding, added extra pt to avoid navbar overlap */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Image Grid */}
          <div className="w-full lg:w-[60%]">
            <div className="grid grid-cols-2 gap-1 md:gap-4">
              {product.images?.length > 0 ? (
                product.images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-[4/5] bg-[#f5f5f5]">
                    <img 
                      src={img} 
                      alt={`${product.name} image ${idx + 1}`} 
                      className="w-full h-full object-cover mix-blend-multiply" 
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 aspect-[4/5] bg-[#f5f5f5] flex items-center justify-center text-gray-400">
                  No images available
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Product Info (Sticky) */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-32 space-y-8">
              
              {/* Title and Price */}
              <div className="border-b border-gray-200 pb-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-xl text-gray-900 font-semibold">
                    ₹{discountedPrice.toFixed(2)}
                  </p>
                  {product.discount > 0 && (
                    <>
                      <p className="text-base text-gray-400 line-through">
                        ₹{product.price.toFixed(2)}
                      </p>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        -{product.discount}%
                      </span>
                    </>
                  )}
                </div>
                <div className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </div>
              </div>
              
              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Color</h3>
                <div className="flex items-center gap-3">
                  {colors.length > 0 ? (
                    colors.map((color: string, idx: number) => {
                      const validColor = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(color) ? `#${color}` : color;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(idx)}
                          className={`w-9 h-9 cursor-pointer rounded-full border border-gray-200 ${
                            selectedColor === idx ? "ring-2 ring-offset-2 ring-gray-900" : ""
                          } transition-all hover:opacity-80`}
                          style={{ backgroundColor: validColor }}
                          aria-label={`Select ${color} color`}
                        />
                      );
                    })
                  ) : (
                     <span className="text-sm text-gray-400">Default Match</span>
                  )}
                </div>
              </div>
              
              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {sizes.length > 0 ? (
                    sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[4rem] h-10 px-4 cursor-pointer border rounded-md font-medium text-sm transition-all flex items-center justify-center ${
                          selectedSize === size
                            ? "border-[#5c3cfa] bg-[#5c3cfa] text-white"
                            : "border-[#d8d8d8] text-[#1a1a1a] hover:border-gray-400 bg-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">One Size Fits All</span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="pt-2 space-y-4">
                <div className="flex gap-4 h-12">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between border border-[#c1b5cf] rounded-lg w-28 px-1 bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-base text-[#5c3cfa]">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => {
                        if (!product) return;
                        setQuantity((prev) => Math.min(product.stock || prev + 1, prev + 1));
                      }}
                      className="p-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                      disabled={product?.stock !== undefined && quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      if (!product || product.stock <= 0) return;
                      const colors = product?.colors?.length > 0 ? product.colors : [];
                      const selectedColorValue = colors[selectedColor] || "";
                      const validColor = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(selectedColorValue)
                        ? `#${selectedColorValue}`
                        : selectedColorValue;
                      addItem({
                        id: product._id,
                        name: product.name,
                        price: discountedPrice,
                        originalPrice: product.price,
                        discount: product.discount,
                        image: product.images?.[0] || "",
                        size: selectedSize,
                        color: validColor,
                        stock: product.stock,
                      }, Math.min(quantity, product.stock));
                    }}
                    className={`flex-1 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm ${product?.stock > 0 ? "bg-black text-white hover:bg-gray-900 cursor-pointer" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                    disabled={product?.stock <= 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product?.stock > 0 ? "Add to cart" : "Out of stock"}
                  </button>
                </div>
                
              {/* Checkout Button */}
                <button 
                  onClick={() => {
                    if (!product || product.stock <= 0) return;
                    const colors = product?.colors?.length > 0 ? product.colors : [];
                    const selectedColorValue = colors[selectedColor] || "";
                    const validColor = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(selectedColorValue)
                      ? `#${selectedColorValue}`
                      : selectedColorValue;
                    addItem({
                      id: product._id,
                      name: product.name,
                      price: discountedPrice,
                      originalPrice: product.price,
                      discount: product.discount,
                      image: product.images?.[0] || "",
                      size: selectedSize,
                      color: validColor,
                      stock: product.stock,
                    }, Math.min(quantity, product.stock));
                    router.push("/checkout");
                  }}
                  className={`w-full h-12 rounded-lg transition-colors font-medium text-sm ${product?.stock > 0 ? "bg-[#5c3cfa] text-white hover:bg-[#4b2fd8] cursor-pointer" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
                  disabled={product?.stock <= 0}
                >
                  {product?.stock > 0 ? "Check out" : "Out of stock"}
                </button>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
      
      {/* You may also like Section */}
      <YouMayAlsoLike />
    </div>
  );
}
