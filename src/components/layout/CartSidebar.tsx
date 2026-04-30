"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCart();

  // Lock background scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Sidebar Panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">Cart</h2>
                {itemCount > 0 && (
                  <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-200" />
                  <p className="text-gray-500 font-medium text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Add some products to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">{item.name}</p>
                          <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Size / Color */}
                        <div className="flex items-center gap-1 mt-1">
                          {item.size && <span className="text-xs text-gray-500 uppercase tracking-wide">{item.size}</span>}
                          {item.size && item.color && <span className="text-gray-300">·</span>}
                          {item.color && (
                            <span className="w-4 h-4 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: item.color }} />
                          )}
                        </div>

                        <p className="text-gray-500 text-xs mt-0.5">₹{item.price.toFixed(2)} each</p>

                        {/* Quantity & Delete */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                              className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer text-gray-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-sm font-medium border-x border-gray-200 py-1.5 min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                              disabled={item.stock !== undefined && item.quantity >= item.stock}
                              className={`px-2.5 py-1.5 transition-colors ${item.stock !== undefined && item.quantity >= item.stock ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer text-gray-600"}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        {item.stock !== undefined && item.quantity >= item.stock && (
                          <p className="text-[11px] text-amber-600 mt-1">Maximum stock reached</p>
                        )}
                          <button
                            onClick={() => removeItem(item.id, item.size, item.color)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 bg-white flex flex-col gap-4">
                {/* Totals */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-gray-600 text-sm">Estimated total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{total.toFixed(2)} <span className="text-base font-semibold text-gray-500">INR</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400">Taxes and shipping calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center bg-black text-white py-4 rounded-xl font-semibold text-base hover:bg-gray-900 transition-colors"
                >
                  Continue to checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
