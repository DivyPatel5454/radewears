"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";

const SHIPPING_FEE = 9;
const TAX_AMOUNT = 5;

const formatCurrency = (value: number) =>
  value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

interface CheckoutFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip: string;
  address: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAccount();
  const [form, setForm] = useState<CheckoutFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zip: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  useEffect(() => {
    if (user) {
      const [firstName, ...rest] = user.name.split(" ");
      setForm((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: rest.join(" ") || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const tax = items.length > 0 ? TAX_AMOUNT : 0;
  const subtotalAfterDiscount = Math.max(0, total - appliedDiscount);
  const totalAmount = subtotalAfterDiscount + shipping + tax;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountError(null);

    try {
      const response = await fetch("/v1/promotions/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          code: discountCode.trim(),
          orderValue: total,
        }),
      });

      const data = await response.json();
      if (!data.valid) {
        setDiscountError(data.message || "Invalid discount code");
        setAppliedDiscount(0);
      } else {
        const discount = data.discountAmount || 0;
        setAppliedDiscount(discount);
        setDiscountError(null);
      }
    } catch (error: any) {
      setDiscountError("Failed to validate discount code");
      setAppliedDiscount(0);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const canSubmit =
    items.length > 0 &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.zip.trim() &&
    form.address.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setErrorMessage("Please complete all required fields before placing your order.");
      return;
    }
    if (!isAuthenticated || !token) {
      setErrorMessage("Please sign in to place your order and securely save it to your account.");
      return;
    }
    if (items.length === 0) {
      setErrorMessage("Your cart is empty. Add items before checkout.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      orderId: `DW-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
      date: new Date().toISOString(),
      customer: {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      address: `${form.address.trim()}, ${form.city.trim()}, ${form.state.trim()} - ${form.zip.trim()}`,
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        qty: item.quantity,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        isCustomDesign: item.isCustomDesign,
        uploadedDesignUrl: item.uploadedDesignUrl,
        uploadedDesignUrls: item.uploadedDesignUrls,
      })),
      subtotal: total,
      discount: appliedDiscount,
      promoCode: discountCode || undefined,
      shipping,
      tax,
      total: totalAmount,
    };

    try {
      const response = await fetch("/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to place order. Please try again.");
      }

      // Redeem the promo code if one was used
      if (discountCode && appliedDiscount > 0) {
        try {
          await fetch("/v1/promotions/redeem", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code: discountCode }),
          });
          // Note: We don't throw on redeem failure to avoid blocking order success
        } catch (redeemError) {
          console.warn("Failed to redeem promo code:", redeemError);
        }
      }

      clearCart();
      setSuccessMessage("Your order has been placed successfully. Thank you for shopping with Radhewears.");
      setTimeout(() => router.push("/account/orders"), 1800);
    } catch (error: any) {
      setErrorMessage(error?.message || "Server error while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-[1360px] px-4 lg:px-8">
        <div className="mb-8 text-sm text-gray-600 flex flex-wrap items-center gap-2">
        <Link href="/" className="font-medium text-gray-900 hover:text-black">
          Shopping
        </Link>
        <span>›</span>
        <span className="text-gray-500">Shipping Address Info</span>
      </div>
      <div className="grid gap-8 xl:grid-cols-[1.58fr_1fr]">
        <section className="rounded-[28px] bg-white p-8 shadow-sm border border-gray-100">
          <div className="mb-8">
            <p className="uppercase tracking-[0.18em] text-xs font-semibold text-black/60">info</p>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
Shipping Address</h1>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-gray-700">
                <span>First Name*</span>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700">
                <span>Last Name*</span>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700">
                <span>Email*</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700">
                <span>Phone Number*</span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </label>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              <p className="mt-2 text-sm text-gray-600">Enter your delivery address so we can save and process the order securely.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-gray-700">
                <span>City*</span>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700">
                <span>State*</span>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </label>
              <label className="space-y-2 text-sm text-gray-700">
                <span>Zip Code*</span>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  placeholder="Zip Code"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-gray-700">
              <span>Address*</span>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address, building, apartment, etc."
                required
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </label>

            {errorMessage && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="w-full rounded-2xl bg-black px-6 py-4 text-base font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Placing order..." : "Continue to payment"}
            </button>
          </form>
        </section>

        <aside className="space-y-6 rounded-[28px] bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
              <p className="text-sm text-gray-500">{items.length} item{items.length === 1 ? "" : "s"} ready for checkout</p>
            </div>
          
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center gap-4 rounded-3xl border border-gray-200 p-4">
                <div className="h-20 w-20 overflow-hidden rounded-3xl bg-gray-100">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gray-200" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.size || "Size N/A"} · {item.color || "Color N/A"}</p>
                  <p className="mt-1 text-xs text-gray-600">Qty: {item.quantity}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-6">
            <div className="mb-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError(null);
                  }}
                  placeholder="Enter discount code"
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={isValidatingDiscount || !discountCode.trim()}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isValidatingDiscount ? "Applying..." : "Apply"}
                </button>
              </div>
              {discountError && (
                <p className="text-xs text-red-600">{discountError}</p>
              )}
              {appliedDiscount > 0 && (
                <p className="text-xs text-emerald-600">✓ Discount applied: {formatCurrency(appliedDiscount)}</p>
              )}
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated taxes</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-4 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              Sign in to securely save your shipping address and order history.
            </div>
          )}

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
      </div>
    </main>
    
  );
}
