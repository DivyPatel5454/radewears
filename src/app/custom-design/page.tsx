"use client";

import React, { useState, useEffect } from "react";
import { Upload, Minus, Plus, ShoppingCart, ArrowLeft, Loader2, Check, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAccount } from "@/context/AccountContext";

export default function CustomDesignPage() {
  const [clothesOpts, setClothesOpts] = useState<any[]>([]);
  const [selectedCloth, setSelectedCloth] = useState<any>(null);

  // Custom design specific state
  const [quantity, setQuantity] = useState(1);
  const [details, setDetails] = useState("");
  const [confirmedCloth, setConfirmedCloth] = useState<any>(null);
  const [uploadedDesigns, setUploadedDesigns] = useState<{ url: string, public_id: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { addItem, toggleCart } = useCart();
  const { isAuthenticated, isInitializing, openAccountSidebar } = useAccount();

  // Product details state (for when a cloth is selected)
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");

  // Fetch real clothes from DB on load
  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const res = await fetch(`/v1/products?category=${encodeURIComponent("Custom Design")}`);
        const data = await res.json();
        if (data.status === "success") {
          // Filter to just clothes if needed, or use all products
          setClothesOpts(data.data.products);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchClothes();
  }, []);

  // Load saved custom design state from localStorage on mount
  useEffect(() => {
    const savedUploads = localStorage.getItem('customDesignUploaded');
    if (savedUploads) {
      try {
        const parsed = JSON.parse(savedUploads);
        if (Array.isArray(parsed)) {
          setUploadedDesigns(parsed);
        } else if (parsed && typeof parsed === 'object') {
          // Backward compatibility
          setUploadedDesigns([parsed]);
        }
      } catch (e) {
        // ignore
      }
    }

    const savedCloth = localStorage.getItem('customDesignConfirmedCloth');
    if (savedCloth) {
      try {
        const parsedCloth = JSON.parse(savedCloth);
        if (parsedCloth && typeof parsedCloth === 'object') {
          setConfirmedCloth(parsedCloth);
          setSelectedColor(parsedCloth.selectedColor ?? 0);
          setSelectedSize(parsedCloth.selectedSize ?? "");
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Sync confirmed cloth selection to localStorage
  useEffect(() => {
    if (confirmedCloth) {
      localStorage.setItem('customDesignConfirmedCloth', JSON.stringify(confirmedCloth));
    } else {
      localStorage.removeItem('customDesignConfirmedCloth');
    }
  }, [confirmedCloth]);

  // Update defaults when cloth selected
  useEffect(() => {
    if (selectedCloth) {
      setSelectedColor(0);
      if (selectedCloth.sizes && selectedCloth.sizes.length > 0) {
        setSelectedSize(selectedCloth.sizes[0]);
      } else {
        setSelectedSize("");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedCloth]);

  // Clear custom design state when user logs out
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      setUploadedDesigns([]);
      setConfirmedCloth(null);
      setSelectedCloth(null);
      setSelectedColor(0);
      setSelectedSize("");
      if (typeof window !== 'undefined') {
        localStorage.removeItem('customDesignUploaded');
        localStorage.removeItem('customDesignConfirmedCloth');
      }
    }
  }, [isAuthenticated, isInitializing]);

  const handleSelectClothConfirm = () => {
    if (selectedCloth) {
      const confirmed = {
        ...selectedCloth,
        selectedColor,
        selectedSize,
      };
      setConfirmedCloth(confirmed);
      localStorage.setItem('customDesignConfirmedCloth', JSON.stringify(confirmed));
    }
    setSelectedCloth(null);
  };

  const handleRemoveDesign = async (e: React.MouseEvent, public_id: string) => {
    e.stopPropagation();

    try {
      const res = await fetch('/v1/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUploadedDesigns(prev => {
          const newDesigns = prev.filter(d => d.public_id !== public_id);
          if (newDesigns.length > 0) {
            localStorage.setItem('customDesignUploaded', JSON.stringify(newDesigns));
          } else {
            localStorage.removeItem('customDesignUploaded');
          }
          return newDesigns;
        });
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch (err) {
      alert("Error deleting file");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      openAccountSidebar();
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, and, PNG ");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('design', file);

    try {
      const res = await fetch('/v1/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        const design = { url: data.data.url, public_id: data.data.public_id };
        setUploadedDesigns(prev => {
          const newDesigns = [...prev, design];
          localStorage.setItem('customDesignUploaded', JSON.stringify(newDesigns));
          return newDesigns;
        });
      } else {
        alert("Failed to upload: " + data.message);
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openAccountSidebar();
      return;
    }
    if (uploadedDesigns.length === 0) {
      alert("Please upload your design first");
      return;
    }
    if (!confirmedCloth) {
      alert("Please select a base cloth below");
      return;
    }

    // Process color correctly
    const colors = confirmedCloth.colors || [];
    const colorValue = colors[confirmedCloth.selectedColor] || "";
    const validColor = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(colorValue)
      ? `#${colorValue}`
      : colorValue || "Default";

    const basePrice = confirmedCloth.price || 0;

    addItem({
      id: `custom-${confirmedCloth._id}-${Date.now()}`,
      name: `Custom Design - ${confirmedCloth.name || "Cloth"}`,
      price: basePrice,
      originalPrice: basePrice,
      discount: 0,
      image: confirmedCloth.images?.[0] || uploadedDesigns[0].url,
      size: confirmedCloth.selectedSize || "Default",
      color: validColor,
      isCustomDesign: true,
      uploadedDesignUrl: uploadedDesigns[0].url,
      uploadedDesignUrls: uploadedDesigns.map(d => d.url),
    }, quantity);

    toggleCart();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">

        {!selectedCloth ? (
          /* ================================
             VIEW 1: CUSTOM DESIGN LAYOUT
             ================================ */
          <div className="flex flex-col">

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              {/* Left Column: Upload area */}
              <div className="w-full lg:w-[55%]">
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                />

                {uploadedDesigns.length === 0 ? (
                  /* ── NO UPLOADS: upload box (+ cloth preview if selected) ── */
                  <div className="flex gap-4 h-[420px]">
                    {/* Cloth preview — only shown when a cloth is confirmed */}
                    {confirmedCloth && (
                      <div className="w-[45%] flex-shrink-0 rounded-2xl overflow-hidden bg-[#e8e4df] h-full">
                        <div className="relative w-full h-full group">
                          <img
                            src={confirmedCloth.images?.[0]}
                            alt={confirmedCloth.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <button
                              onClick={() => setConfirmedCloth(null)}
                              className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-colors w-full text-center"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload box */}
                    <div className="flex-1 h-full">
                      {!uploading ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border border-[#5c3cfa] bg-white rounded-2xl flex flex-col items-center justify-center text-center h-full gap-5 cursor-pointer overflow-hidden relative transition-colors hover:bg-indigo-50/30"
                        >
                          <Upload className="w-12 h-12 text-[#1a1a1a]" strokeWidth={1.2} />
                          <p className="font-bold text-[14px] text-[#1a1a1a]">Uplode your Design</p>
                          <button className="bg-[#5c3cfa] text-white px-8 py-2.5 rounded-full text-sm font-medium pointer-events-none">
                            Browse
                          </button>
                        </div>
                      ) : (
                        <div className="border border-dashed border-[#5c3cfa] bg-white rounded-2xl flex flex-col items-center justify-center h-full gap-3">
                          <Loader2 className="w-8 h-8 text-[#5c3cfa] animate-spin" />
                          <p className="text-xs font-semibold text-gray-600">Uploading...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── HAS UPLOADS: full-width aspect-[3/4] grid — same size as "Select cloth" ── */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {uploadedDesigns.map((design, idx) => (
                        <div key={design.public_id} className="relative group aspect-[3/4] rounded-2xl overflow-hidden bg-[#e8e6e3] border border-black/5">
                          {design.url.endsWith('.pdf') ? (
                            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100">
                              <span className="text-3xl font-bold text-gray-400">PDF</span>
                            </div>
                          ) : (
                            <img src={design.url} alt={`Uploaded ${idx+1}`} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-md z-10">
                            <Check className="w-3 h-3" />
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <button
                              onClick={(e) => handleRemoveDesign(e, design.public_id)}
                              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-transform hover:scale-110 shadow-lg cursor-pointer"
                              title="Remove design"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add More — same aspect-[3/4] card */}
                      <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed border-[#5c3cfa] bg-[#fafafa] flex flex-col items-center justify-center gap-4 overflow-hidden transition-colors ${!uploading ? 'cursor-pointer hover:bg-indigo-50' : ''}`}
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-[#5c3cfa] animate-spin" />
                            <p className="text-sm font-semibold text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <Plus className="w-10 h-10 text-[#5c3cfa]" />
                            <p className="text-sm font-medium text-[#5c3cfa]">Add More</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Confirmed cloth strip below the grid */}
                    {confirmedCloth && (
                      <div className="mt-4 p-4 border border-gray-200 rounded-xl flex items-center gap-4 bg-gray-50">
                        <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={confirmedCloth.images?.[0]} alt="cloth" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{confirmedCloth.name}</h4>
                          <p className="text-xs text-gray-500">
                            Size: {confirmedCloth.selectedSize || "Default"} · Color: {confirmedCloth.colors?.[confirmedCloth.selectedColor] || "Default"}
                          </p>
                        </div>
                        <button onClick={() => setConfirmedCloth(null)} className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer">
                          Remove
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right Column: Information & Form */}
              <div className="w-full lg:w-[45%] flex flex-col pt-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-1">
                  Custom Design
                </h1>
                <p className="text-gray-500 text-base mb-4">
                  {confirmedCloth ? `₹${(confirmedCloth.price || 0).toFixed(2)}` : "Select a cloth to see price"}
                </p>

                <hr className="border-gray-200 mb-6" />

                {/* Quantity and Cart Controls */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Quantity */}
                  <div className="flex items-center justify-between border border-gray-300 rounded-2xl w-32 h-[50px] px-3 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-medium w-6 text-center text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white rounded-2xl h-[50px] flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors font-medium text-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to cart
                  </button>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-[#5c3cfa] text-white rounded-2xl h-[50px] hover:bg-[#4b2fd8] transition-colors font-medium text-sm mb-4 cursor-pointer">
                  Check out
                </button>

                {/* Textarea */}
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Add more deals about the design"
                  className="w-full h-44 border border-gray-300 rounded-lg p-4 resize-none text-sm text-gray-500 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5c3cfa] focus:border-[#5c3cfa]"
                />
              </div>
            </div>

            {/* Bottom Section: Select Cloth */}
            <div className="mt-20" id="select-cloth-section">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select cloth</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {clothesOpts.length === 0 ? (
                  <>
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="aspect-[3/4] bg-[#e8e6e3] rounded-2xl animate-pulse" />
                    ))}
                  </>
                ) : (
                  clothesOpts.map((cloth) => (
                    <div
                      key={cloth._id}
                      onClick={() => setSelectedCloth(cloth)}
                      className={`aspect-[3/4] rounded-2xl cursor-pointer hover:opacity-90 transition-all overflow-hidden relative border-2 ${
                        confirmedCloth?._id === cloth._id
                          ? 'border-[#5c3cfa] shadow-md'
                          : 'border-transparent'
                      } bg-[#e8e6e3]`}
                    >
                      {cloth.images && cloth.images[0] && (
                        <img
                          src={cloth.images[0]}
                          alt={cloth.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {confirmedCloth?._id === cloth._id && (
                        <div className="absolute top-2 right-2 bg-[#5c3cfa] text-white p-1.5 rounded-full shadow-md">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          /* ================================
             VIEW 2: CLOTH DETAIL (SELECTION)
             ================================ */
          <div className="flex flex-col">
            <button
              onClick={() => setSelectedCloth(null)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Custom Design
            </button>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

              {/* Left Column: Image Grid */}
              <div className="w-full lg:w-[60%]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedCloth?.images || []).length > 0 ? (
                    selectedCloth.images.map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative aspect-[3/4] w-full bg-[#f4f2f0] overflow-hidden rounded-lg border border-black/5">
                        <img
                          src={imgUrl}
                          alt={`cloth detail ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="relative aspect-[3/4] w-full bg-[#f4f2f0] overflow-hidden rounded-lg">
                      <img
                        src="https://i.ibb.co/JWMyjcnX/logo.png"
                        alt="cloth placeholder"
                        className="w-full h-full object-cover opacity-5"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Product Detail & Selection */}
              <div className="w-full lg:w-[40%]">
                <div className="sticky top-32 space-y-8 border-t border-gray-100 pt-4 lg:border-none lg:pt-0">

                  {/* Title */}
                  <div className="border-b border-gray-200 pb-6">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                      {selectedCloth?.name || "Product Title"}
                    </h1>
                    {selectedCloth?.price != null && (
                      <p className="text-2xl font-semibold text-gray-900 mt-3">
                        ₹{selectedCloth.price.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-6">
                    {/* Color Selection */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Color</h3>
                      <div className="flex items-center gap-3">
                        {selectedCloth?.colors && selectedCloth.colors.length > 0 ? (
                          selectedCloth.colors.map((color: string, idx: number) => {
                            const validColor = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(color) ? `#${color}` : color;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedColor(idx)}
                                className={`w-9 h-9 cursor-pointer rounded-full border border-gray-200 ${selectedColor === idx ? "ring-2 ring-offset-2 ring-gray-900" : ""
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
                        {selectedCloth?.sizes && selectedCloth.sizes.length > 0 ? (
                          selectedCloth.sizes.map((size: string) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`min-w-[3.5rem] h-9 px-4 cursor-pointer border rounded-md font-medium text-sm transition-all flex items-center justify-center ${selectedSize === size
                                  ? "border-[#5c3cfa] bg-[#5c3cfa] text-white"
                                  : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
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
                  </div>

                  {/* Select Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSelectClothConfirm}
                      className="w-full h-12 bg-[#5c3cfa] text-white rounded-lg hover:bg-[#4b2fd8] transition-colors font-medium text-sm cursor-pointer"
                    >
                      Select
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
