"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Edit2, Trash2, Search, Filter, X, Image as ImageIcon,
  Package, Tag, ShoppingCart, Copy, Check, AlertTriangle,
  Calendar, ToggleLeft, ToggleRight, Percent, DollarSign,
  Eye, Truck, ChevronDown, RefreshCw, RotateCcw, Download,
  BarChart2, TrendingUp, Award
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  discount: number;
  images: string[];
  colors?: string[];
  sizes?: string[];
  adminId?: string;
}

interface Promotion {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  usageLimit: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  oneTimePerCustomer: boolean;
  createdAt: string;
}

type ActiveView = "products" | "orders" | "promotions" | "analytics";

// ─────────────────────────────────────────────────────────────
// Order Types
// ─────────────────────────────────────────────────────────────
type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

interface OrderItem {
  productId?: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  trackingId?: string;
  adminId?: string;
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
  discount?: number;
  promoCode?: string;
  status: OrderStatus;
  address: string;
  refundApproved?: boolean;
  cancelReason?: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function promoStatus(p: Promotion): { label: string; color: string } {
  const now = new Date();
  if (!p.isActive) return { label: "Inactive", color: "gray" };
  if (p.startDate && new Date(p.startDate) > now) return { label: "Scheduled", color: "blue" };
  if (p.endDate && new Date(p.endDate) < now) return { label: "Expired", color: "red" };
  if (p.usageLimit !== null && p.usedCount >= p.usageLimit) return { label: "Exhausted", color: "orange" };
  return { label: "Active", color: "green" };
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────
// Products View  (unchanged from before)
// ─────────────────────────────────────────────────────────────
function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "", description: "", category: "",
    price: 0 as string | number, stock: 0 as string | number,
    discount: 0 as string | number, images: "", colors: "", sizes: "",
    adminId: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/v1/products?includeOutOfStock=true");
      const data = await res.json();
      if (data.status === "success") setProducts(data.data.products);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, description: product.description, category: product.category,
        price: product.price, stock: product.stock, discount: product.discount,
        images: product.images.join(", "),
        colors: product.colors?.join(", ") || "",
        sizes: product.sizes?.join(", ") || "",
        adminId: product.adminId || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", description: "", category: "", price: 0, stock: 0, discount: 0, images: "", colors: "", sizes: "", adminId: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = formData.images.split(",").map((img) => img.trim()).filter((img) => img);
    const colorsArray = formData.colors.split(",").map((c) => {
      const trimmed = c.trim();
      return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(trimmed) ? `#${trimmed}` : trimmed;
    }).filter((c) => c);
    const sizesArray = formData.sizes.split(",").map((s) => s.trim()).filter((s) => s);
    const payload = {
      ...formData,
      price: Number(formData.price), stock: Number(formData.stock), discount: Number(formData.discount),
      images: imagesArray, colors: colorsArray, sizes: sizesArray,
      adminId: formData.adminId.trim() || undefined,
    };
    try {
      const url = editingProduct ? `/v1/products/${editingProduct._id}` : "/v1/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { fetchProducts(); closeModal(); }
      else alert("Action failed. Check console.");
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/v1/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Product Management</h1>
        </div>
        <button onClick={() => openModal()} className="adm-btn-primary">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="adm-table-wrap">
        <div className="adm-table-toolbar">
          <div className="adm-search-box">
            <Search size={14} className="adm-search-icon" />
            <input type="text" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className="adm-search-input" />
          </div>
          <button className="adm-btn-outline"><Filter size={14} /> Filters</button>
        </div>
        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th><th>Discount</th><th>Stock</th><th>Tracking ID</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td colSpan={8} style={{ padding: 0 }}>
                      <div className="sk-table-row">
                        <div className="adm-skeleton sk-table-cell" style={{ height: 36, maxWidth: 36, flex: 'none', borderRadius: 6 }}></div>
                        <div className="adm-skeleton sk-table-cell"></div>
                        <div className="adm-skeleton sk-table-cell"></div>
                        <div className="adm-skeleton sk-table-cell"></div>
                        <div className="adm-skeleton sk-table-cell"></div>
                        <div className="adm-skeleton sk-table-cell" style={{ maxWidth: 80 }}></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="adm-empty-cell">{products.length === 0 ? "No products yet. Add one to get started." : "No results match your search."}</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="adm-product-cell">
                        <div className="adm-thumb">{p.images?.length > 0 ? <img src={p.images[0]} alt={p.name} className="adm-thumb-img" /> : <ImageIcon size={14} color="#94a3b8" />}</div>
                        <span className="adm-strong">{p.name}</span>
                      </div>
                    </td>
                    <td className="adm-muted">{p.category}</td>
                    <td className="adm-strong">₹{p.price.toLocaleString("en-IN")}</td>
                    <td className="adm-muted">{p.discount}%</td>
                    <td className="adm-strong">{p.stock}</td>
                    <td className="adm-strong" style={{ fontFamily: "monospace", fontSize: "12px", color: "#2563eb" }}>{p.adminId || "—"}</td>
                    <td>
                      {p.stock > 10 ? <span className="adm-badge adm-badge-green">In Stock</span>
                        : p.stock > 0 ? <span className="adm-badge adm-badge-yellow">Low Stock</span>
                          : <span className="adm-badge adm-badge-red">Out of Stock</span>}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="adm-actions">
                        <button onClick={() => openModal(p)} className="adm-act-btn adm-act-edit" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p._id)} className="adm-act-btn adm-act-del" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="adm-table-footer">Showing {filtered.length} of {products.length} products</div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="adm-overlay" onClick={closeModal}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={closeModal} className="adm-modal-close"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="span2"><label className="adm-label">Product Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter product name" className="adm-input" /></div>
                  <div className="span2"><label className="adm-label">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} placeholder="Enter description" className="adm-input adm-textarea" /></div>
                  <div>
                    <label className="adm-label">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} required className="adm-input">
                      <option value="" disabled>Select a category</option>
                      <option value="Clothes">Clothes</option><option value="Men's wear">Men&apos;s wear</option>
                      <option value="Ladies wear">Ladies wear</option><option value="Kids wear">Kids wear</option>
                      <option value="Top selling">Top selling</option><option value="Accessories">Accessories</option>
                      <option value="Car enthusiast">Car enthusiast</option><option value="Car poster">Car poster</option>
                      <option value="Photo frame">Photo frame</option><option value="Limited edition">Limited edition</option>
                      <option value="Trending">Trending</option><option value="Custom Design">Custom Design</option>
                    </select>
                  </div>
                  <div><label className="adm-label">Price (₹)</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" placeholder="0.00" className="adm-input" /></div>
                  <div><label className="adm-label">Stock Quantity</label><input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" className="adm-input" /></div>
                  <div><label className="adm-label">Discount (%)</label><input type="number" name="discount" value={formData.discount} onChange={handleInputChange} min="0" max="100" className="adm-input" /></div>
                  <div><label className="adm-label">Tracking ID</label><input type="text" name="adminId" value={formData.adminId} onChange={handleInputChange} placeholder="Unique tracking ID for storage location" className="adm-input" /></div>
                  <div className="span2">
                    <label className="adm-label">Product Images — comma-separated URLs</label>
                    <div className="adm-img-previews">{formData.images.split(",").map(img => img.trim()).filter(img => img).map((img, i) => (<div key={`${img}-${i}`} className="adm-img-preview"><img src={img} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /></div>))}</div>
                    <textarea name="images" value={formData.images} onChange={handleInputChange} required rows={2} placeholder="https://…, https://…" className="adm-input adm-textarea adm-mono" />
                  </div>
                  <div className="span2">
                    <label className="adm-label">Colors (hex/names, comma-separated)</label>
                    <div className="adm-color-dots">{formData.colors.split(",").map(c => c.trim()).filter(c => c).map((c, i) => { const v = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(c) ? `#${c}` : c; return <div key={`${c}-${i}`} className="adm-color-dot" style={{ backgroundColor: v }} />; })}</div>
                    <input type="text" name="colors" value={formData.colors} onChange={handleInputChange} placeholder="e.g., #5c3cfa, Red" className="adm-input" />
                  </div>
                  <div className="span2">
                    <label className="adm-label">Sizes (comma-separated)</label>
                    <div className="adm-size-chips">{formData.sizes.split(",").map(s => s.trim()).filter(s => s).map((s, i) => (<span key={`${s}-${i}`} className="adm-size-chip">{s}</span>))}</div>
                    <input type="text" name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="XS, S, M, L, XL" className="adm-input" />
                  </div>
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="button" onClick={closeModal} className="adm-btn-outline">Cancel</button>
                <button type="submit" className="adm-btn-primary">{editingProduct ? "Save Changes" : "Add Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Orders View
// ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Pending", "Cancelled"];

const statusBadgeClass: Record<OrderStatus, string> = {
  Delivered: "adm-badge-green",
  Processing: "adm-badge-blue",
  Shipped: "adm-badge-purple",
  Pending: "adm-badge-yellow",
  Cancelled: "adm-badge-red",
};

function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError("Admin authentication required. Please sign in before loading orders.");
        setLoading(false);
        return;
      }

      const res = await fetch("/v1/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.status === "success") setOrders(data.data.orders);
      else setError(data.message || "Failed to load orders.");
    } catch {
      setError("Could not reach server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      const token = getToken();
      const res = await fetch(`/v1/orders/${order._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus, ...(newStatus === "Cancelled" ? { refundApproved: false } : {}) }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id
              ? { ...o, status: newStatus, refundApproved: newStatus === "Cancelled" ? false : o.refundApproved }
              : o
          )
        );
        if (selectedOrder?._id === order._id) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
        }
      }
    } catch (err) { console.error(err); }
    setStatusDropdownOpen(false);
  };

  const approveRefund = async (orderId: string) => {
    try {
      const token = getToken();
      const res = await fetch(`/v1/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ refundApproved: true }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o._id === orderId ? { ...o, refundApproved: true } : o)
        );
      }
    } catch (err) { console.error(err); }
  };

  const tabs: Array<"all" | OrderStatus> = ["all", "Pending", "Processing", "Shipped", "Delivered"];

  const filtered = orders.filter((o) => {
    const matchesTab = activeTab === "all" || o.status === activeTab;
    const matchesSearch =
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch && o.status !== "Cancelled";
  });

  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Order Management</h1>
        </div>
        <button className="adm-btn-outline" onClick={fetchOrders}><RefreshCw size={14} /> Refresh</button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div className="ord-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            className={`ord-tab${activeTab === t ? " ord-tab-active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t === "all" ? "All Orders" : t}
          </button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <div className="adm-table-toolbar">
          <div className="adm-search-box">
            <Search size={14} className="adm-search-icon" />
            <input
              type="text"
              placeholder="Search orders by ID, customer, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
          <button className="adm-btn-outline"><Filter size={14} /> Filters</button>
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div className="sk-table-row">
                        <div className="adm-skeleton sk-table-cell" style={{ maxWidth: 100 }}></div>
                        <div className="adm-skeleton sk-table-cell"></div>
                        <div className="adm-skeleton sk-table-cell" style={{ maxWidth: 80 }}></div>
                        <div className="adm-skeleton sk-table-cell" style={{ maxWidth: 60 }}></div>
                        <div className="adm-skeleton sk-table-cell" style={{ maxWidth: 80 }}></div>
                        <div className="adm-skeleton sk-table-cell" style={{ maxWidth: 100 }}></div>
                        <div className="adm-skeleton sk-table-cell" style={{ maxWidth: 40 }}></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="adm-empty-cell">No orders found.</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id}>
                    <td className="adm-strong">{order.orderId}</td>
                    <td>
                      <div className="adm-strong">{order.customer.name}</div>
                      <div className="adm-muted" style={{ fontSize: 12 }}>{order.customer.email}</div>
                    </td>
                    <td className="adm-muted">{order.date}</td>
                    <td className="adm-muted">{order.items.reduce((s, i) => s + i.qty, 0)}</td>
                    <td className="adm-strong">₹{order.total.toFixed(2)}</td>
                    <td>
                      <span className={`adm-badge ${statusBadgeClass[order.status]}`}>{order.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="adm-actions">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="adm-act-btn"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedOrder(order); setStatusDropdownOpen(true); }}
                          className="adm-act-btn"
                          title="Update Tracking"
                        >
                          <Truck size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="adm-table-footer">Showing {filtered.length} orders</div>
      </div>

      {/* ── Cancelled Orders Section ── */}
      <div className="ord-cancelled-section">
        <div className="ord-cancelled-header">
          <div>
            <h2 className="ord-cancelled-title">Cancelled Orders</h2>
            <p className="ord-cancelled-sub">Review cancelled orders and approve refunds for eligible customers.</p>
          </div>
          <span className="adm-badge adm-badge-red" style={{ fontSize: 13, padding: "4px 12px" }}>
            {cancelledOrders.length} Cancelled
          </span>
        </div>

        {cancelledOrders.length === 0 ? (
          <div className="ord-cancelled-empty">
            <RotateCcw size={32} color="#cbd5e1" />
            <p>No cancelled orders at the moment.</p>
          </div>
        ) : (
          <div className="adm-table-scroll" style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Reason</th>
                  <th>Order Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {cancelledOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="adm-strong">{order.orderId}</td>
                    <td>
                      <div className="adm-strong">{order.customer.name}</div>
                      <div className="adm-muted" style={{ fontSize: 12 }}>{order.customer.email}</div>
                    </td>
                    <td className="adm-muted">{order.date}</td>
                    <td className="adm-strong">₹{order.total.toFixed(2)}</td>
                    <td className="adm-muted" style={{ maxWidth: 180, fontSize: 12 }}>
                      {order.cancelReason || "—"}
                    </td>
                    <td>
                      <span className={`adm-badge ${statusBadgeClass[order.status]}`}>{order.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!order.refundApproved && (
                        <button
                          className="adm-btn-primary"
                          style={{ fontSize: 12, padding: "6px 12px" }}
                          onClick={() => approveRefund(order._id)}
                        >
                          <Check size={13} /> Approve Refund
                        </button>
                      )}
                      {order.refundApproved && (
                        <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>✓ Refunded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div className="adm-overlay" onClick={() => { setSelectedOrder(null); setStatusDropdownOpen(false); }}>
          <div className="adm-modal ord-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h3>Order Details — {selectedOrder.orderId}</h3>
              <button onClick={() => { setSelectedOrder(null); setStatusDropdownOpen(false); }} className="adm-modal-close"><X size={16} /></button>
            </div>
            <div className="adm-modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Customer + status */}
              <div className="ord-detail-row">
                <div>
                  <p className="adm-muted" style={{ fontSize: 12 }}>Customer</p>
                  <p className="adm-strong" style={{ fontSize: 15 }}>{selectedOrder.customer.name}</p>
                  <p className="adm-muted" style={{ fontSize: 13 }}>{selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone && <p className="adm-muted" style={{ fontSize: 13 }}>{selectedOrder.customer.phone}</p>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="adm-muted" style={{ fontSize: 12 }}>Order Date</p>
                  <p className="adm-strong" style={{ fontSize: 14 }}>{selectedOrder.date}</p>
                  <span className={`adm-badge ${statusBadgeClass[selectedOrder.status]}`} style={{ marginTop: 6, display: "inline-flex" }}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Shipping info — no Method or Tracking */}
              <div className="ord-info-box">
                <p className="adm-label" style={{ marginBottom: 6 }}>Shipping Information</p>
                <p className="adm-muted" style={{ fontSize: 13 }}>Address: {selectedOrder.address}</p>
              </div>

              {/* Order Items */}
              <div>
                <p className="adm-label" style={{ marginBottom: 8 }}>Order Items</p>
                <div className="ord-items-list">
                  {selectedOrder.items.map((item: any, i: number) => (
                    <div key={`${item.productId || 'item'}-${i}`} className="ord-item-row" style={{ gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                        <div className="rounded-xl overflow-hidden bg-gray-100" style={{ width: 80, height: 80 }}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p className="adm-strong" style={{ fontSize: 14 }}>{item.name}</p>
                          <p className="adm-muted" style={{ fontSize: 12 }}>Qty: {item.qty}</p>
                          {item.size && <p className="adm-muted" style={{ fontSize: 12 }}>Size: {item.size}</p>}
                          {item.color && (
                            <p className="adm-muted" style={{ fontSize: 12 }}>
                              Color: <span style={{ display: "inline-flex", width: 12, height: 12, borderRadius: 9999, backgroundColor: item.color, marginRight: 6, verticalAlign: "middle", border: "1px solid #e2e8f0" }} /> {item.color}
                            </p>
                          )}
                          {(item.trackingId || item.adminId) && (
                            <div style={{ marginTop: 8, padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #dbeafe" }}>
                              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Tracking ID</p>
                              <p style={{ fontSize: 13, fontWeight: 600, margin: "4px 0 0" }}>{item.trackingId || item.adminId}</p>
                            </div>
                          )}
                          {item.productId && !item.productId.startsWith("custom-") && (
                            <Link href={`/product/${item.productId}`} className="adm-btn-outline" style={{ display: "inline-flex", marginTop: 8, fontSize: 12, padding: "5px 10px", color: "#2563eb", borderColor: "#bfdbfe", background: "#eff6ff" }}>
                              View product
                            </Link>
                          )}
                          {item.isCustomDesign && (
                            <div style={{ marginTop: 8 }}>
                              <p className="adm-muted" style={{ fontSize: 11, marginBottom: 6, fontWeight: 600 }}>Customer Uploaded Designs:</p>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {item.uploadedDesignUrls && item.uploadedDesignUrls.length > 0 ? (
                                  item.uploadedDesignUrls.map((designUrl: string, designIdx: number) => (
                                    <a
                                      key={designIdx}
                                      href={designUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={`custom-design-${selectedOrder.orderId}-${designIdx + 1}.${designUrl.split('.').pop()}`}
                                      className="adm-btn-primary"
                                      style={{ display: "inline-flex", fontSize: 12, padding: "6px 12px", background: "#059669", borderColor: "#059669" }}
                                    >
                                      <Download size={13} /> Download Design {item.uploadedDesignUrls.length > 1 ? `${designIdx + 1}` : ''}
                                    </a>
                                  ))
                                ) : item.uploadedDesignUrl ? (
                                  <a
                                    href={item.uploadedDesignUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={`custom-design-${selectedOrder.orderId}.${item.uploadedDesignUrl.split('.').pop()}`}
                                    className="adm-btn-primary"
                                    style={{ display: "inline-flex", fontSize: 12, padding: "6px 12px", background: "#059669", borderColor: "#059669" }}
                                  >
                                    <Download size={13} /> Download Design
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-500">No design files available</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="adm-strong">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="ord-totals">
                <div className="ord-total-row"><span className="adm-muted">Subtotal</span><span className="adm-muted">₹{selectedOrder.subtotal.toFixed(2)}</span></div>
                {(selectedOrder.discount ?? 0) > 0 && (
                  <div className="ord-total-row" style={{ color: "#16a34a" }}>
                    <span>Discount {selectedOrder.promoCode ? `(${selectedOrder.promoCode})` : ''}</span>
                    <span>-₹{(selectedOrder.discount ?? 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="ord-total-row"><span className="adm-muted">Shipping</span><span className="adm-muted">₹{selectedOrder.shipping.toFixed(2)}</span></div>
                <div className="ord-total-row"><span className="adm-muted">Tax</span><span className="adm-muted">₹{selectedOrder.tax.toFixed(2)}</span></div>
                <div className="ord-total-row" style={{ fontWeight: 700, color: "#0f172a", borderTop: "1px solid #e2e8f0", paddingTop: 10, marginTop: 4 }}>
                  <span>Total</span><span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="adm-modal-foot" style={{ justifyContent: "space-between" }}>
              {/* Update Tracking dropdown */}
              <div className="ord-dropdown-wrap" ref={dropRef}>
                <button
                  className="adm-btn-primary"
                  onClick={() => setStatusDropdownOpen((p) => !p)}
                >
                  <Truck size={14} /> Update Tracking <ChevronDown size={13} />
                </button>
                {statusDropdownOpen && (
                  <div className="ord-dropdown">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        className={`ord-dropdown-item${selectedOrder.status === s ? " ord-dropdown-item-active" : ""}`}
                        onClick={() => updateStatus(selectedOrder, s)}
                      >
                        <span className={`adm-badge ${statusBadgeClass[s]}`} style={{ fontSize: 11 }}>{s}</span>
                        {selectedOrder.status === s && <Check size={13} color="#2563eb" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="adm-btn-outline"
                onClick={() => { setSelectedOrder(null); setStatusDropdownOpen(false); }}
              >
                <X size={14} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Promotions View
// ─────────────────────────────────────────────────────────────
function PromotionsView() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const emptyForm = {
    code: "", description: "", discountType: "percentage" as "percentage" | "fixed",
    discountValue: "" as string | number, minOrderValue: "" as string | number,
    usageLimit: "" as string | number, startDate: "", endDate: "",
    isActive: true, oneTimePerCustomer: false,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/v1/promotions");
      const data = await res.json();
      if (data.status === "success") setPromotions(data.data.promotions);
      else setError("Failed to load promotions.");
    } catch { setError("Could not reach server."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const openModal = (promo: Promotion | null = null) => {
    setFormError(null);
    if (promo) {
      setEditingPromo(promo);
      setForm({
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minOrderValue: promo.minOrderValue || "",
        usageLimit: promo.usageLimit ?? "",
        startDate: promo.startDate ? promo.startDate.slice(0, 10) : "",
        endDate: promo.endDate ? promo.endDate.slice(0, 10) : "",
        isActive: promo.isActive,
        oneTimePerCustomer: promo.oneTimePerCustomer,
      });
    } else {
      setEditingPromo(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingPromo(null); setFormError(null); };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderValue: form.minOrderValue !== "" ? Number(form.minOrderValue) : 0,
      usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      isActive: form.isActive,
      oneTimePerCustomer: form.oneTimePerCustomer,
    };
    try {
      const url = editingPromo ? `/v1/promotions/${editingPromo._id}` : "/v1/promotions";
      const method = editingPromo ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { fetchPromotions(); closeModal(); }
      else setFormError(data.message ?? "Failed to save promotion.");
    } catch { setFormError("Network error. Try again."); }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promotion "${code}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/v1/promotions/${id}`, { method: "DELETE" });
      if (res.ok) fetchPromotions();
    } catch (err) { console.error(err); }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      await fetch(`/v1/promotions/${promo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      fetchPromotions();
    } catch { }
  };

  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); } catch { }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const filtered = promotions.filter((p) =>
    p.code.includes(search.toUpperCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const active = promotions.filter((p) => promoStatus(p).label === "Active").length;
  const expired = promotions.filter((p) => promoStatus(p).label === "Expired").length;
  const scheduled = promotions.filter((p) => promoStatus(p).label === "Scheduled").length;

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Promotions & Discounts</h1>
        </div>
        <button onClick={() => openModal()} className="adm-btn-primary"><Plus size={15} /> Create Promotion</button>
      </div>
      {loading ? (
        <div className="promo-list" style={{ marginTop: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="promo-card" style={{ gap: 20 }}>
              <div className="promo-card-left" style={{ gap: 12, width: '100%' }}>
                <div className="adm-skeleton" style={{ height: 24, width: '40%' }}></div>
                <div className="adm-skeleton" style={{ height: 16, width: '70%' }}></div>
                <div className="adm-skeleton" style={{ height: 16, width: '50%' }}></div>
              </div>
              <div className="promo-card-right">
                <div className="adm-skeleton" style={{ height: 28, width: 80, borderRadius: 6 }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="adm-err"><AlertTriangle size={18} /> {error} <button onClick={fetchPromotions} className="adm-btn-outline">Retry</button></div>
      ) : (
        <div className="adm-table-wrap">
          <div className="adm-table-toolbar">
            <div className="adm-search-box">
              <Search size={14} className="adm-search-icon" />
              <input type="text" placeholder="Search by code or description…" value={search} onChange={(e) => setSearch(e.target.value)} className="adm-search-input" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="promo-empty">
              <Tag size={36} color="#cbd5e1" />
              <p>{promotions.length === 0 ? "No promo codes yet. Create your first one!" : "No results match your search."}</p>
            </div>
          ) : (
            <div className="promo-list">
              {filtered.map((promo) => {
                const st = promoStatus(promo);
                return (
                  <div key={promo._id} className="promo-card">
                    <div className="promo-card-left">
                      <div className="promo-code-row">
                        <span className="promo-code">{promo.code}</span>
                        <span className={`adm-badge adm-badge-${st.color}`}>{st.label}</span>
                        <span className="adm-badge adm-badge-purple">
                          {promo.discountType === "percentage" ? <Percent size={10} /> : <DollarSign size={10} />}
                          {promo.discountType === "percentage" ? `${promo.discountValue}% off` : `₹${promo.discountValue} off`}
                        </span>
                      </div>
                      <p className="promo-desc">{promo.description}</p>
                      <div className="promo-meta">
                        <span><Calendar size={11} /> {fmtDate(promo.startDate)} → {fmtDate(promo.endDate)}</span>
                        {promo.minOrderValue > 0 && <span>Min order: ₹{promo.minOrderValue.toLocaleString("en-IN")}</span>}
                        <span>Used: {promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ""}</span>
                      </div>
                      {promo.usageLimit && (
                        <div className="promo-usage-bar">
                          <div className="promo-usage-fill" style={{ width: `${Math.min((promo.usedCount / promo.usageLimit) * 100, 100)}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="promo-card-right">
                      <button onClick={() => copyCode(promo.code)} className="adm-act-btn" title="Copy code">
                        {copiedCode === promo.code ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => toggleActive(promo)} className="adm-act-btn" title={promo.isActive ? "Deactivate" : "Activate"}>
                        {promo.isActive ? <ToggleRight size={16} color="#2563eb" /> : <ToggleLeft size={16} color="#94a3b8" />}
                      </button>
                      <button onClick={() => openModal(promo)} className="adm-act-btn adm-act-edit" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(promo._id, promo.code)} className="adm-act-btn adm-act-del" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Promo Modal */}
      {isModalOpen && (
        <div className="adm-overlay" onClick={closeModal}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h3>{editingPromo ? "Edit Promotion" : "Create New Promotion"}</h3>
              <button onClick={closeModal} className="adm-modal-close"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="adm-modal-body">
                {formError && (
                  <div className="adm-form-error"><AlertTriangle size={14} /> {formError}</div>
                )}
                <div className="adm-form-grid">
                  <div>
                    <label className="adm-label">Promo Code *</label>
                    <input type="text" name="code" value={form.code} onChange={handleFormChange} required placeholder="e.g. SUMMER25" className="adm-input adm-mono" style={{ textTransform: "uppercase" }} maxLength={50} disabled={!!editingPromo} />
                    {editingPromo && <p className="adm-hint">Code cannot be changed after creation.</p>}
                  </div>
                  <div>
                    <label className="adm-label">Discount Type *</label>
                    <select name="discountType" value={form.discountType} onChange={handleFormChange} required className="adm-input">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="span2">
                    <label className="adm-label">Description *</label>
                    <input type="text" name="description" value={form.description} onChange={handleFormChange} required placeholder="e.g. Summer sale – 25% off all items" className="adm-input" maxLength={200} />
                  </div>
                  <div>
                    <label className="adm-label">{form.discountType === "percentage" ? "Discount Value (%)" : "Discount Value (₹)"} *</label>
                    <input type="number" name="discountValue" value={form.discountValue} onChange={handleFormChange} required min="0" max={form.discountType === "percentage" ? "100" : undefined} step="0.01" placeholder={form.discountType === "percentage" ? "25" : "200"} className="adm-input" />
                  </div>
                  <div>
                    <label className="adm-label">Min Order Value (₹)</label>
                    <input type="number" name="minOrderValue" value={form.minOrderValue} onChange={handleFormChange} min="0" step="0.01" placeholder="0.00 (no minimum)" className="adm-input" />
                  </div>
                  <div>
                    <label className="adm-label">Usage Limit</label>
                    <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleFormChange} min="1" step="1" placeholder="Leave empty for unlimited" className="adm-input" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end" }}>
                    <label className="adm-label">Options</label>
                    <label className="adm-check-label">
                      <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleFormChange} className="adm-check" />
                      Active (enable immediately)
                    </label>
                    <label className="adm-check-label">
                      <input type="checkbox" name="oneTimePerCustomer" checked={form.oneTimePerCustomer} onChange={handleFormChange} className="adm-check" />
                      One-time use per customer
                    </label>
                  </div>
                  <div>
                    <label className="adm-label">Start Date</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} className="adm-input" />
                  </div>
                  <div>
                    <label className="adm-label">End Date</label>
                    <input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} className="adm-input" />
                  </div>
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="button" onClick={closeModal} className="adm-btn-outline">Cancel</button>
                <button type="submit" className="adm-btn-primary">{editingPromo ? "Save Changes" : "Create Promotion"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Analytics View
// ─────────────────────────────────────────────────────────────
function AnalyticsView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) {
          setError("Admin authentication required to view analytics.");
          setLoading(false);
          return;
        }

        const [ordersRes, productsRes] = await Promise.all([
          fetch("/v1/orders", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/v1/products?includeOutOfStock=true")
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        if (ordersData.status === "success" && productsData.status === "success") {
          setOrders(ordersData.data.orders);
          setProducts(productsData.data.products);
        } else {
          setError("Failed to load analytics data.");
        }
      } catch (err) {
        setError("Could not reach server.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="analytics-view">
      <div className="adm-page-header" style={{ marginBottom: 24 }}>
        <div style={{ width: '100%' }}>
          <div className="adm-skeleton sk-header"></div>
          <div className="adm-skeleton sk-sub"></div>
        </div>
      </div>
      <div className="ana-summary-grid">
        <div className="adm-skeleton sk-card" style={{ borderRadius: 16 }}></div>
        <div className="adm-skeleton sk-card" style={{ borderRadius: 16 }}></div>
        <div className="adm-skeleton sk-card" style={{ borderRadius: 16 }}></div>
      </div>
      <div className="ana-charts-grid" style={{ marginTop: 24 }}>
        <div className="adm-skeleton sk-chart"></div>
        <div className="adm-skeleton sk-chart"></div>
      </div>
    </div>
  );
  if (error) return <div className="adm-err"><AlertTriangle size={18} /> {error}</div>;

  // -- CALCULATIONS --
  // Process real data
  const validOrders = orders.filter(o => o.status !== "Cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = validOrders.length;

  const monthlyRevenue: Record<string, number> = {};
  const monthlyOrders: Record<string, number> = {};

  validOrders.forEach(o => {
    let d = new Date(o.date);
    if (isNaN(d.getTime())) d = new Date(); // fallback
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total;
    monthlyOrders[key] = (monthlyOrders[key] || 0) + 1;
  });

  const months = Object.keys(monthlyRevenue).sort();
  const perMonthAvg = months.length ? totalRevenue / months.length : 0;

  // Chart data (up to last 12 months)
  const chartData = months.slice(-12).map(m => {
    const [y, mt] = m.split("-");
    const label = new Date(Number(y), Number(mt) - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return { label, revenue: monthlyRevenue[m], orders: monthlyOrders[m] };
  });

  // Create dummy chart data if no real orders are present to avoid broken empty chart area
  if (chartData.length === 0) {
    chartData.push({ label: 'No Data', revenue: 0, orders: 0 });
  }

  const maxChartRev = Math.max(...chartData.map(d => d.revenue), 100);

  // Top Products
  const productStats: Record<string, { name: string, rev: number, units: number, priceHist: number[] }> = {};
  validOrders.forEach(o => {
    o.items.forEach(item => {
      const pid = item.productId || item.name;
      if (!productStats[pid]) productStats[pid] = { name: item.name, rev: 0, units: 0, priceHist: [] };
      productStats[pid].rev += item.price * item.qty;
      productStats[pid].units += item.qty;
      productStats[pid].priceHist.push(item.price);
    });
  });

  const topProducts = Object.values(productStats).sort((a, b) => b.rev - a.rev).slice(0, 5);

  // Category Performance
  const categoryStats: Record<string, number> = {};
  validOrders.forEach(o => {
    o.items.forEach(item => {
      const prod = products.find(p => p._id === item.productId || p.name === item.name);
      const cat = prod?.category || "Other";
      categoryStats[cat] = (categoryStats[cat] || 0) + (item.price * item.qty);
    });
  });

  const topCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCatRev = Math.max(...topCategories.map(c => c[1]), 100);

  return (
    <div className="analytics-view">
      <div className="adm-page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="adm-page-title">Analytics Dashboard</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ana-summary-grid">
        <div className="ana-summary-card">
          <div className="ana-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <DollarSign size={24} />
          </div>
          <div className="ana-card-content">
            <p className="ana-card-title">Total Revenue</p>
            <h2 className="ana-card-val">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <p className="ana-card-sub" style={{ color: '#10b981' }}><TrendingUp size={12} /> {months.length || 0} Month(s) Data</p>
          </div>
        </div>

        <div className="ana-summary-card">
          <div className="ana-icon-wrap" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <ShoppingCart size={24} />
          </div>
          <div className="ana-card-content">
            <p className="ana-card-title">Total Orders</p>
            <h2 className="ana-card-val">{totalOrders}</h2>
            <p className="ana-card-sub" style={{ color: '#3b82f6' }}>Active successful orders</p>
          </div>
        </div>

        <div className="ana-summary-card">
          <div className="ana-icon-wrap" style={{ background: '#f5f3ff', color: '#c084fc' }}>
            <BarChart2 size={24} />
          </div>
          <div className="ana-card-content">
            <p className="ana-card-title">Avg. Monthly Revenue</p>
            <h2 className="ana-card-val">₹{perMonthAvg.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <p className="ana-card-sub" style={{ color: '#c084fc' }}>Per month across history</p>
          </div>
        </div>
      </div>

      <div className="ana-charts-grid">
        {/* Chart */}
        <div className="ana-chart-box">
          <div className="ana-box-header">
            <h3>Revenue Trend</h3>
            <div className="ana-chart-toggle">
              <span className="active">Revenue</span>
            </div>
          </div>
          <div className="ana-bars-container">
            {chartData.map((d, i) => {
              const h = Math.max((d.revenue / maxChartRev) * 100, 2); // Minimum 2% height for visibility
              return (
                <div key={i} className="ana-bar-col">
                  <div className="ana-bar-tooltip">₹{d.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({d.orders} orders)</div>
                  <div className="ana-bar" style={{ height: `${h}%` }}></div>
                  <span className="ana-bar-label">{d.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Performance */}
        <div className="ana-chart-box">
          <div className="ana-box-header">
            <h3>Category Performance</h3>
          </div>
          <div className="ana-cat-list">
            {topCategories.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No data available</div>
            ) : topCategories.map(([cat, rev], i) => (
              <div key={i} className="ana-cat-item">
                <div className="ana-cat-info">
                  <span className="ana-cat-name">{cat}</span>
                  <span className="ana-cat-rev">₹{rev.toLocaleString("en-IN")}</span>
                </div>
                <div className="ana-cat-bar-wrap">
                  <div className="ana-cat-bar" style={{ width: `${Math.max((rev / maxCatRev) * 100, 2)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="ana-chart-box" style={{ marginTop: 24 }}>
        <div className="ana-box-header">
          <h3>Top Performing Products</h3>
          <Award size={18} color="#10b981" />
        </div>
        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Revenue</th>
                <th>Units Sold</th>
                <th>Avg. Price</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr><td colSpan={5} className="adm-empty-cell">No products sold yet.</td></tr>
              ) : (
                topProducts.map((p, i) => {
                  const avgPrice = p.priceHist.length > 0 ? p.priceHist.reduce((s, x) => s + x, 0) / p.priceHist.length : 0;
                  return (
                    <tr key={i}>
                      <td><span className="ana-rank">{i + 1}</span></td>
                      <td className="adm-strong">{p.name}</td>
                      <td className="adm-strong" style={{ color: '#0f172a' }}>₹{(p.rev).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{p.units}</td>
                      <td className="adm-muted">₹{avgPrice.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Root Admin Page
// ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeView, setActiveView] = useState<ActiveView>("analytics");

  const navItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "promotions", label: "Promotions", icon: Tag },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .adm-shell { display: flex; height: 100vh; background: #f8fafc; font-family: 'Inter', 'Segoe UI', sans-serif; overflow: hidden; }

        /* Sidebar */
        .adm-sidebar { width: 240px; flex-shrink: 0; background: #fff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
        .adm-logo { height: 64px; display: flex; align-items: center; padding: 0 20px; border-bottom: 1px solid #e2e8f0; gap: 10px; }
        .adm-logo-icon { width: 34px; height: 34px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; color: #fff; }
        .adm-logo-text { font-weight: 700; font-size: 15px; color: #1e293b; }
        .adm-nav { flex: 1; padding: 14px 12px; display: flex; flex-direction: column; gap: 3px; }
        .adm-nav-btn { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; font-size: 13.5px; font-weight: 500; color: #64748b; cursor: pointer; border: none; background: none; width: 100%; text-align: left; transition: background .12s, color .12s; }
        .adm-nav-btn:hover { background: #f1f5f9; color: #1e293b; }
        .adm-nav-btn.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
        .adm-sidebar-foot { padding: 16px 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
        .adm-avatar { width: 34px; height: 34px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: 700; font-size: 14px; flex-shrink: 0; }
        .adm-foot-name { font-size: 13px; font-weight: 600; color: #1e293b; }
        .adm-foot-role { font-size: 11px; color: #94a3b8; }

        /* Main */
        .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .adm-topbar { height: 64px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; flex-shrink: 0; }
        .adm-topbar-search { display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 12px; width: 280px; }
        .adm-topbar-search input { border: none; outline: none; background: transparent; font-size: 13px; color: #374151; width: 100%; }
        .adm-content { flex: 1; overflow-y: auto; padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; }

        /* Page header */
        .adm-page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .adm-page-title { font-size: 22px; font-weight: 700; color: #0f172a; }
        .adm-page-sub { font-size: 13px; color: #64748b; margin-top: 4px; max-width: 520px; }

        /* Buttons */
        .adm-btn-primary { display: flex; align-items: center; gap: 6px; background: #2563eb; color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background .15s; white-space: nowrap; }
        .adm-btn-primary:hover { background: #1d4ed8; }
        .adm-btn-outline { display: flex; align-items: center; gap: 6px; background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background .15s; }
        .adm-btn-outline:hover { background: #f9fafb; }

        /* Table */
        .adm-table-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.04); overflow: hidden; }
        .adm-table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 13px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; gap: 10px; }
        .adm-search-box { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #d1d5db; border-radius: 7px; padding: 7px 12px; flex: 1; max-width: 320px; }
        .adm-search-icon { color: #9ca3af; flex-shrink: 0; }
        .adm-search-input { border: none; outline: none; background: transparent; font-size: 13px; color: #374151; width: 100%; }
        .adm-table-scroll { overflow-x: auto; }
        .adm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .adm-table thead tr { background: #f8fafc; }
        .adm-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid #e2e8f0; }
        .adm-table td { padding: 11px 14px; border-bottom: 1px solid #f1f5f9; color: #374151; vertical-align: middle; }
        .adm-table tbody tr:last-child td { border-bottom: none; }
        .adm-table tbody tr:hover { background: #f9fafb; }
        .adm-empty-cell { text-align: center; padding: 40px; color: #94a3b8; }
        .adm-table-footer { padding: 11px 16px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .adm-product-cell { display: flex; align-items: center; gap: 10px; }
        .adm-thumb { width: 36px; height: 36px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 7px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .adm-thumb-img { width: 100%; height: 100%; object-fit: cover; }
        .adm-strong { font-weight: 600; color: #1e293b; }
        .adm-muted { color: #64748b; }
        .adm-actions { display: flex; justify-content: flex-end; gap: 6px; }
        .adm-act-btn { padding: 5px; border: none; border-radius: 6px; background: none; cursor: pointer; color: #64748b; transition: background .12s, color .12s; }
        .adm-act-edit:hover { background: #eff6ff; color: #2563eb; }
        .adm-act-del:hover { background: #fef2f2; color: #dc2626; }

        /* Badges */
        .adm-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 20px; font-size: 11.5px; font-weight: 600; }
        .adm-badge-green { background: #dcfce7; color: #15803d; }
        .adm-badge-yellow { background: #fef9c3; color: #a16207; }
        .adm-badge-red { background: #fee2e2; color: #b91c1c; }
        .adm-badge-blue { background: #dbeafe; color: #1d4ed8; }
        .adm-badge-orange { background: #ffedd5; color: #c2410c; }
        .adm-badge-gray { background: #f1f5f9; color: #64748b; }
        .adm-badge-purple { background: #f3e8ff; color: #7c3aed; }

        /* Modal */
        .adm-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(15,23,42,.5); display: flex; align-items: center; justify-content: center; padding: 16px; overflow: auto; }
        .adm-modal { background: #fff; border-radius: 14px; box-shadow: 0 24px 64px rgba(0,0,0,.22); width: 100%; max-width: 580px; max-height: 90vh; display: flex; flex-direction: column; }
        .adm-modal-head { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
        .adm-modal-head h3 { font-size: 17px; font-weight: 700; color: #0f172a; }
        .adm-modal-close { background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; border-radius: 6px; } .adm-modal-close:hover { background: #f1f5f9; }
        .adm-modal form { display: flex; flex-direction: column; flex: 1; min-height: 0; }
        .adm-modal-body { padding: 24px; overflow-y: auto; flex: 1; min-height: 0; }
        .adm-modal-foot { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; border-radius: 0 0 14px 14px; flex-shrink: 0; }
        .adm-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .span2 { grid-column: span 2; }
        .adm-label { display: block; font-size: 12.5px; font-weight: 600; color: #374151; margin-bottom: 5px; }
        .adm-input { width: 100%; padding: 8px 11px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; color: #111827; background: #f9fafb; outline: none; transition: border-color .15s, background .15s; }
        .adm-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
        .adm-input:disabled { opacity: .6; cursor: not-allowed; }
        .adm-textarea { resize: none; }
        .adm-mono { font-family: 'Courier New', monospace; letter-spacing: .05em; }
        .adm-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }
        .adm-check-label { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #374151; cursor: pointer; }
        .adm-check { width: 15px; height: 15px; cursor: pointer; accent-color: #2563eb; }
        .adm-form-error { display: flex; align-items: center; gap: 8px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #b91c1c; margin-bottom: 16px; grid-column: span 2; }
        .adm-img-previews { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
        .adm-img-preview { width: 44px; height: 44px; border-radius: 6px; border: 1px solid #e2e8f0; overflow: hidden; }
        .adm-img-preview img { width: 100%; height: 100%; object-fit: cover; }
        .adm-color-dots { display: flex; gap: 6px; margin-bottom: 6px; }
        .adm-color-dot { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .adm-size-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 6px; }
        .adm-size-chip { padding: 3px 9px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-weight: 500; color: #374151; }

        /* Promotions-specific */
        .promo-summary { display: flex; gap: 12px; }
        .promo-pill { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; }
        .promo-pill span { font-weight: 700; font-size: 16px; }
        .promo-pill-green { background: #f0fdf4; color: #15803d; }
        .promo-pill-blue { background: #eff6ff; color: #1d4ed8; }
        .promo-pill-red { background: #fef2f2; color: #b91c1c; }
        .promo-pill-gray { background: #f8fafc; color: #64748b; }
        .promo-list { display: flex; flex-direction: column; }
        .promo-card { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; gap: 16px; transition: background .12s; }
        .promo-card:last-child { border-bottom: none; }
        .promo-card:hover { background: #f9fafb; }
        .promo-card-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
        .promo-card-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .promo-code-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .promo-code { font-family: 'Courier New', monospace; font-size: 15px; font-weight: 700; color: #1e293b; letter-spacing: .05em; }
        .promo-desc { font-size: 13px; color: #374151; }
        .promo-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; font-size: 11.5px; color: #64748b; }
        .promo-meta span { display: flex; align-items: center; gap: 4px; }
        .promo-usage-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-top: 4px; max-width: 280px; }
        .promo-usage-fill { height: 100%; background: #3b82f6; border-radius: 2px; transition: width .4s; }
        .promo-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px; color: #94a3b8; font-size: 14px; }

        /* Misc */
        .adm-loading { padding: 40px; text-align: center; color: #64748b; font-size: 14px; }
        .adm-err { display: flex; align-items: center; gap: 10px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 14px 18px; color: #b91c1c; font-size: 13px; }

        /* Orders */
        .ord-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .ord-tab { padding: 6px 16px; border-radius: 20px; font-size: 12.5px; font-weight: 500; border: 1px solid #d1d5db; background: #fff; color: #64748b; cursor: pointer; transition: all .15s; }
        .ord-tab:not(.ord-tab-active):hover { background: #f1f5f9; }
        .ord-tab-active { background: #2563eb; color: #fff; border-color: #2563eb; }
        .ord-modal { max-width: 560px; }
        .ord-detail-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .ord-info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
        .ord-items-list { border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
        .ord-item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
        .ord-item-row:last-child { border-bottom: none; }
        .ord-totals { display: flex; flex-direction: column; gap: 8px; }
        .ord-total-row { display: flex; justify-content: space-between; font-size: 13.5px; }
        .ord-dropdown-wrap { position: relative; }
        .ord-dropdown { position: absolute; bottom: calc(100% + 8px); left: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 8px 30px rgba(0,0,0,.14); min-width: 200px; overflow: hidden; z-index: 100; }
        .ord-dropdown-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; width: 100%; border: none; background: none; cursor: pointer; font-size: 13px; transition: background .12s; }
        .ord-dropdown-item:hover { background: #f1f5f9; }
        .ord-dropdown-item-active { background: #eff6ff; }
        .ord-cancelled-section { display: flex; flex-direction: column; gap: 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 24px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
        .ord-cancelled-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ord-cancelled-title { font-size: 18px; font-weight: 700; color: #0f172a; }
        .ord-cancelled-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
        .ord-cancelled-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 36px; color: #94a3b8; font-size: 14px; }
        
        /* Analytics View Specifics */
        .analytics-view { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .ana-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; }
        .ana-summary-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: transform 0.2s, box-shadow 0.2s; }
        .ana-icon-wrap { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ana-card-content { display: flex; flex-direction: column; gap: 4px; }
        .ana-card-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .ana-card-val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .ana-card-sub { font-size: 12.5px; font-weight: 500; display: flex; align-items: center; gap: 4px; }

        .ana-charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        @media (max-width: 1024px) { .ana-charts-grid { grid-template-columns: 1fr; } }
        .ana-chart-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .ana-box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ana-box-header h3 { font-size: 16px; font-weight: 700; color: #0f172a; }
        .ana-chart-toggle { display: flex; background: #f1f5f9; border-radius: 20px; padding: 4px; font-size: 12px; font-weight: 600; color: #64748b; }
        .ana-chart-toggle span { padding: 6px 14px; border-radius: 16px; cursor: default; }
        .ana-chart-toggle span.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

        .ana-bars-container { display: flex; align-items: flex-end; justify-content: space-around; height: 260px; gap: 12px; padding-top: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
        .ana-bar-col { display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 1; height: 100%; justify-content: flex-end; position: relative; }
        .ana-bar { width: 100%; max-width: 60px; background: linear-gradient(180deg, #a855f7 0%, #7e22ce 100%); border-radius: 6px 6px 0 0; transition: height 0.5s ease-out, opacity 0.2s, background 0.2s; box-shadow: inset 0 2px 4px rgba(255,255,255,0.2); }
        .ana-bar-col:hover .ana-bar { opacity: 0.85; filter: brightness(1.1); }
        .ana-bar-tooltip { position: absolute; top: -35px; background: #1e293b; color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap; opacity: 0; transition: all 0.2s; transform: translateY(10px); z-index: 10; pointer-events: none; }
        .ana-bar-col:hover .ana-bar-tooltip { opacity: 1; transform: translateY(0); }
        .ana-bar-label { font-size: 11px; font-weight: 500; color: #64748b; }

        .ana-cat-list { display: flex; flex-direction: column; gap: 20px; padding-top: 8px; }
        .ana-cat-item { display: flex; flex-direction: column; gap: 8px; }
        .ana-cat-info { display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600; }
        .ana-cat-name { color: #374151; }
        .ana-cat-rev { color: #0f172a; }
        .ana-cat-bar-wrap { width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
        .ana-cat-bar { height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }

        .ana-rank { display: inline-flex; width: 26px; height: 26px; background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; align-items: center; justify-content: center; border-radius: 6px; }

        /* Skeletons */
        .adm-skeleton { background: #e2e8f0; border-radius: 8px; position: relative; overflow: hidden; }
        .adm-skeleton::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(255,255,255,0) 0, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%); animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .sk-header { width: 30%; height: 28px; margin-bottom: 8px; }
        .sk-sub { width: 45%; height: 16px; margin-bottom: 0px; }
        .sk-card { height: 104px; width: 100%; }
        .sk-chart { height: 350px; width: 100%; border-radius: 16px; }
        .sk-table-row { height: 56px; display: flex; align-items: center; gap: 16px; padding: 0 16px; width: 100%; box-sizing: border-box; }
        .sk-table-cell { height: 16px; flex: 1; border-radius: 4px; }
      `}</style>

      <div className="adm-shell">
        {/* Sidebar */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <div className="adm-logo-icon">D</div>
            <span className="adm-logo-text">Admin Panel</span>
          </div>
          <nav className="adm-nav">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`adm-nav-btn${activeView === id ? " active" : ""}`} onClick={() => setActiveView(id)}>
                <Icon size={16} />{label}
              </button>
            ))}
          </nav>
          <div className="adm-sidebar-foot">
            <div className="adm-avatar">A</div>
            <div>
              <p className="adm-foot-name">Admin User</p>
              <p className="adm-foot-role">admin@radhewears.com</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="adm-main">
          <header className="adm-topbar">
            <div className="adm-topbar-search">
              <Search size={14} color="#9ca3af" />
              <input type="text" placeholder="Search products, orders, users..." />
            </div>
            <div className="adm-avatar">A</div>
          </header>
          <main className="adm-content">
            {activeView === "products" ? <ProductsView /> : activeView === "orders" ? <OrdersView /> : activeView === "analytics" ? <AnalyticsView /> : <PromotionsView />}
          </main>
        </div>
      </div>
    </>
  );
}
