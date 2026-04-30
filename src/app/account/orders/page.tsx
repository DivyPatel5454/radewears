"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "@/context/AccountContext";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag, Receipt, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  isCustomDesign?: boolean;
  uploadedDesignUrl?: string;
  uploadedDesignUrls?: string[];
}

interface Order {
  _id: string;
  orderId: string;
  customer: { name: string; email: string; phone?: string };
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;  promoCode?: string;  status: string;
  address: string;
  refundApproved?: boolean;
  cancelReason?: string;
}

const statusConfig: Record<string, { color: string, icon: any, bg: string, border: string }> = {
  Pending: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  Processing: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Package },
  Shipped: { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: Truck },
  Delivered: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
  Cancelled: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function AccountOrdersPage() {
  const { isAuthenticated, token, openAccountSidebar } = useAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setError("Please sign in to view your order history.");
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/v1/users/me/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.status === "success") {
          // SORT orders: latest first
          const sortedOrders = (data.data.orders || []).sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(sortedOrders);
        } else {
          setError(data.message || "Unable to load your order history.");
        }
      } catch {
        setError("Could not reach the server. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-28 pb-20">
      <div className="mx-auto max-w-[1000px] px-4 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">Order History</span>
            </div>
            <p className="uppercase tracking-[0.18em] text-xs font-semibold text-black/50 mb-2">My Account</p>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Order History</h1>
            <p className="mt-3 max-w-xl text-base text-gray-600">
              Check the status of recent orders, manage returns, and discover similar products.
            </p>
            
          </div>
        </div>

        {!isAuthenticated ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in to view your orders</h2>
            <p className="mt-3 text-gray-600 max-w-md mx-auto">Secure account login keeps your order history safe and synced across all your devices.</p>
            <button
              type="button"
              onClick={openAccountSidebar}
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-black px-8 py-4 text-base font-semibold text-white transition hover:bg-gray-800 shadow-md hover:shadow-lg"
            >
              Sign into your account
            </button>
          </motion.div>
        ) : (
          <section className="space-y-8">
            
            {/* Stats Row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-2">Total Orders</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
                <p className="font-medium animate-pulse">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm flex flex-col items-center">
                <XCircle className="w-10 h-10 text-red-400 mb-4" />
                <p className="font-semibold">{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[32px] border border-gray-200 bg-white p-16 text-center shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders found</h3>
                <p className="text-gray-500 max-w-sm mb-8">You haven't placed any orders yet. Start exploring our collections to find something you love.</p>
                <Link href="/" className="inline-flex rounded-2xl bg-black px-8 py-4 text-base font-semibold text-white transition hover:bg-gray-800 hover:shadow-lg">
                  Start Shopping
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                {orders.map((order) => {
                  const statusInfo = statusConfig[order.status] || { color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200", icon: Package };
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.article key={order._id} variants={itemVariants} className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                      
                      {/* Order Header Info */}
                      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-5 sm:px-8 sm:py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap gap-x-8 gap-y-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500 mb-1">Order Number</p>
                              <p className="text-base font-medium text-gray-900">{order.orderId}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Date Placed</p>
                              <p className="text-base font-medium text-gray-900">{formatDate(order.date)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500 mb-1">Total Amount</p>
                              <p className="text-base font-bold text-gray-900">{formatCurrency(order.total)}</p>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {order.status}
                          </div>
                        </div>
                      </div>

                      {/* Order Body Details */}
                      <div className="grid gap-0 sm:grid-cols-[1.5fr_1fr] divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        
                        {/* Left Side: Items */}
                        <div className="p-6 sm:p-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-400" /> Order Items ({order.items.reduce((acc, item) => acc + item.qty, 0)})
                          </h3>
                          <div className="space-y-6">
                            {order.items.map((item, idx) => (
                              <div key={`${order._id}-${idx}`} className="flex items-center gap-5 group">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                  ) : (
                                    <span className="text-xs text-gray-400 uppercase">No Image</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-base font-semibold text-gray-900 line-clamp-2">{item.name}</h4>
                                    <p className="text-base font-bold text-gray-900 whitespace-nowrap">{formatCurrency(item.price * item.qty)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">Qty: {item.qty} &times; {formatCurrency(item.price)}</p>
                                  
                                  <div className="flex flex-wrap items-center gap-3 mt-2">
                                    {item.size && (
                                      <span className="inline-flex items-center rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
                                        Size: {item.size}
                                      </span>
                                    )}
                                    {item.color && (
                                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
                                        Color: <span className="inline-block w-3 h-3 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: item.color }}></span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Side: Summary & Address */}
                        <div className="p-6 sm:p-8 bg-gray-50/30 flex flex-col gap-8">
                          
                          {/* Shipping Address */}
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-[0.05em]">
                              <MapPin className="w-4 h-4 text-gray-400" /> Delivery Address
                            </h3>
                            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                              <p className="text-sm leading-relaxed text-gray-600">
                                <span className="block font-semibold text-gray-900 mb-1">{order.customer.name}</span>
                                {order.address}
                              </p>
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-[0.05em]">
                              <Receipt className="w-4 h-4 text-gray-400" /> Payment Summary
                            </h3>
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
                              </div>
                              {(order.discount ?? 0) > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                  <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                                  <span className="font-medium">-{formatCurrency(order.discount ?? 0)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span className="font-medium text-gray-900">{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Taxes</span>
                                <span className="font-medium text-gray-900">{formatCurrency(order.tax)}</span>
                              </div>
                              <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between">
                                <span className="text-base font-bold text-gray-900">Total</span>
                                <span className="text-base font-bold text-gray-900">{formatCurrency(order.total)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Notifications */}
                          {(order.cancelReason || order.refundApproved) && (
                            <div className="space-y-3 mt-auto">
                              {order.cancelReason && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3 items-start">
                                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-bold text-red-800">Cancellation Note</p>
                                    <p className="text-sm text-red-700 mt-1">{order.cancelReason}</p>
                                  </div>
                                </div>
                              )}
                              {order.refundApproved && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3 items-start">
                                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                  <p className="text-sm font-medium text-emerald-800">Refund has been approved for this order.</p>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}