'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import WebGLLitStage from '@/components/WebGLLitStage';
import {
  ASSET_CATALOGUE,
  CATEGORIES,
  CategorySlug,
  AssetItem,
  getAssetsByCategory,
} from '@/data/catalogue';

export default function Act3Configurator() {
  const [activeCategory, setActiveCategory] = useState<CategorySlug>('luxury-fleet');
  const categoryAssets = useMemo(() => getAssetsByCategory(activeCategory), [activeCategory]);

  const [selectedAssetSlug, setSelectedAssetSlug] = useState<string>('range-rover-vogue');
  const [quantity, setQuantity] = useState<number>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Active asset
  const activeAsset: AssetItem = useMemo(() => {
    const found = ASSET_CATALOGUE.find((a) => a.slug === selectedAssetSlug);
    return found || categoryAssets[0] || ASSET_CATALOGUE[0];
  }, [selectedAssetSlug, categoryAssets]);

  // Tenure bounded dynamically to asset's allowed tenure
  const [tenure, setTenure] = useState<number>(activeAsset.minTenureMonths);

  // When asset changes, re-clamp tenure if out of bounds
  React.useEffect(() => {
    if (tenure < activeAsset.minTenureMonths) {
      setTenure(activeAsset.minTenureMonths);
    } else if (tenure > activeAsset.maxTenureMonths) {
      setTenure(activeAsset.maxTenureMonths);
    }
  }, [activeAsset, tenure]);

  // Switch category helper (each category defaults to a distinct, flagship asset with unique photography)
  const handleCategoryChange = (slug: CategorySlug) => {
    setActiveCategory(slug);
    const newAssets = getAssetsByCategory(slug);
    if (newAssets.length > 0) {
      let defaultAsset = newAssets[0];
      if (slug === 'luxury-fleet') {
        defaultAsset = newAssets.find((a) => a.slug === 'range-rover-vogue') || newAssets[0];
      } else if (slug === 'construction-warehouse') {
        defaultAsset = newAssets.find((a) => a.slug === 'tower-crane-40-tonne') || newAssets[0];
      } else if (slug === 'it-hardware') {
        defaultAsset =
          newAssets.find((a) => a.slug === 'macbook-pro-m4-fleet') ||
          newAssets.find((a) => a.slug === 'dell-poweredge-r750-server') ||
          newAssets[0];
      }
      setSelectedAssetSlug(defaultAsset.slug);
      setTenure(defaultAsset.minTenureMonths);
    }
  };

  // Indian Number Format utility
  const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculations
  const tenureRangeSpan = Math.max(1, activeAsset.maxTenureMonths - activeAsset.minTenureMonths);
  const tenureProgress = (tenure - activeAsset.minTenureMonths) / tenureRangeSpan;
  // Subtle tenure efficiency factor: 0% to 8% discount for maximum commitment
  const tenureEfficiency = 1.0 - tenureProgress * 0.08;
  const estimatedMonthlyLease = Math.round(activeAsset.monthlyRentINR * quantity * tenureEfficiency);
  // Upfront capital preserved (approximate capex avoided ~32x monthly per asset)
  const upfrontCapitalPreserved = Math.round(activeAsset.monthlyRentINR * 32 * quantity);

  return (
    <section
      className="relative w-full bg-[#0E0F11] text-[#F4F2EE] border-b border-[#C27D4B]/20 py-16 sm:py-24 md:py-32 select-none overflow-hidden"
      id="configurator"
      data-nav-theme="dark"
    >
      {/* Background subtle architectural coordinates */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C27D4B 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 relative z-10">
        {/* Header Eyebrow & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-8 sm:pb-12 border-b border-[#C27D4B]/20 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#C27D4B]" />
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                LEASE CALCULATOR
              </span>
            </div>
            <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-semibold text-[#F4F2EE] tracking-tight">
              Estimate Your Lease.
            </h2>
          </div>
          <p className="text-xs font-mono text-[#F4F2EE]/60 max-w-sm">
            Model real-time monthly operational expenditures and balance-sheet capital preservation
            under Section 37(1).
          </p>
        </div>

        {/* Studio Split-Screen Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 55%: WebGLLitStage showing active asset */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#C27D4B] uppercase tracking-widest px-1">
              <span>{activeAsset.title}</span>
              <span className="text-[#F4F2EE]/40">{activeAsset.availability}</span>
            </div>

            <div className="relative shadow-2xl border border-[#C27D4B]/30 bg-[#17191D]">
              <WebGLLitStage
                key={activeAsset.slug}
                imageSrc={activeAsset.imageSrc}
                alt={activeAsset.title}
                assetTitle={activeAsset.title}
                assetCategory={activeAsset.categoryLabel}
                aspectRatio="16/10"
              />
            </div>

            {/* Quick Specs Bar under Stage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {activeAsset.specs.map((spec, sIdx) => (
                <div key={sIdx} className="bg-[#17191D] p-3 border border-white/[0.06]">
                  <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">
                    {spec.label}
                  </div>
                  <div className="font-mono text-xs text-[#F4F2EE] truncate font-medium mt-0.5">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Trigger Link */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="mt-2 text-left text-xs font-mono text-[#C27D4B] hover:text-[#D89564] uppercase tracking-wider flex items-center gap-2 group w-fit"
            >
              <span className="underline underline-offset-4 group-hover:translate-x-1 transition-transform">
                Inspect 6 Specifications & Special Terms →
              </span>
            </button>
          </div>

          {/* Right 45%: Swiss-Watch Precision Monospace Control Panel */}
          <div className="lg:col-span-5 bg-[#17191D] border border-[#C27D4B]/30 p-5 sm:p-8 flex flex-col gap-6 sm:gap-8 shadow-2xl relative">
            {/* Top Control Bar: Category Switch */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-[0.25em] text-[#C27D4B] mb-2 sm:mb-3">
                01 · SELECT ASSET VERTICAL
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['luxury-fleet', 'construction-warehouse', 'it-hardware'] as CategorySlug[]).map(
                  (slug) => {
                    const isSel = activeCategory === slug;
                    return (
                      <button
                        key={slug}
                        onClick={() => handleCategoryChange(slug)}
                        className={`min-h-[44px] py-2 px-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-center border transition-all flex items-center justify-center ${
                          isSel
                            ? 'bg-[#C27D4B] text-[#0E0F11] font-bold border-[#C27D4B]'
                            : 'bg-[#0E0F11] text-[#F4F2EE]/60 border-white/10 hover:border-[#C27D4B]/40 hover:text-white active:bg-white/5'
                        }`}
                      >
                        {slug === 'luxury-fleet'
                          ? 'Fleet'
                          : slug === 'construction-warehouse'
                          ? 'Heavy'
                          : 'IT'}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Asset Dropdown / Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                  02 · TARGET ASSET MODEL
                </label>
                <span className="text-[10px] font-mono text-[#F4F2EE]/40">
                  {categoryAssets.length} Available in Hub
                </span>
              </div>
              <select
                value={selectedAssetSlug}
                onChange={(e) => setSelectedAssetSlug(e.target.value)}
                className="w-full bg-[#0E0F11] border border-[#C27D4B]/40 text-[#F4F2EE] font-mono text-xs py-3 px-3.5 min-h-[44px] focus:outline-none focus:border-[#C27D4B] transition-colors cursor-pointer"
              >
                {categoryAssets.map((asset) => (
                  <option key={asset.slug} value={asset.slug} className="bg-[#0E0F11] text-[#F4F2EE]">
                    {asset.title} ({asset.monthlyRentFormatted} / mo)
                  </option>
                ))}
              </select>
            </div>

            {/* Tactile Range Slider: Quantity (1–20) */}
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C27D4B]">
                  03 · ASSET QUANTITY
                </span>
                <span className="font-bold text-[#F4F2EE] bg-[#0E0F11] px-2.5 py-0.5 border border-white/10">
                  {quantity} {quantity === 1 ? 'UNIT' : 'UNITS'}
                </span>
              </div>
              <div className="py-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#C27D4B] bg-[#0E0F11] h-2 cursor-pointer appearance-none border border-white/10"
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#F4F2EE]/40 mt-1">
                <span>01 UNIT</span>
                <span>10 UNITS</span>
                <span>20 UNITS (FLEET PACK)</span>
              </div>
            </div>

            {/* Tactile Range Slider: Tenure (Dynamically bounded) */}
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C27D4B]">
                  04 · OPERATING TENURE
                </span>
                <span className="font-bold text-[#F4F2EE] bg-[#0E0F11] px-2.5 py-0.5 border border-white/10">
                  {tenure} MONTHS
                </span>
              </div>
              <div className="py-2">
                <input
                  type="range"
                  min={activeAsset.minTenureMonths}
                  max={activeAsset.maxTenureMonths}
                  value={tenure}
                  onChange={(e) => setTenure(parseInt(e.target.value, 10))}
                  className="w-full accent-[#C27D4B] bg-[#0E0F11] h-2 cursor-pointer appearance-none border border-white/10"
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[#F4F2EE]/40 mt-1">
                <span>{activeAsset.minTenureMonths}M (MIN)</span>
                {tenureProgress > 0 && (
                  <span className="text-[#C27D4B]">
                    -{(tenureProgress * 8).toFixed(1)}% EFFICIENCY
                  </span>
                )}
                <span>{activeAsset.maxTenureMonths}M (MAX)</span>
              </div>
            </div>

            {/* Live Numerical Readouts */}
            <div className="bg-[#0E0F11] border border-[#C27D4B]/30 p-5 space-y-4">
              {/* Estimated Monthly Lease */}
              <div className="border-b border-white/[0.08] pb-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#F4F2EE]/50">
                  ESTIMATED MONTHLY LEASE OUTLAY
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-[#C27D4B] mt-1 tabular-numbers">
                  {formatINR(estimatedMonthlyLease)}
                  <span className="text-xs font-normal text-[#F4F2EE]/50 ml-2">/ month + GST</span>
                </div>
                <div className="text-[9px] font-mono text-[#F4F2EE]/40 mt-0.5">
                  100% Tax Deductible Operating Expense under Sec 37(1)
                </div>
              </div>

              {/* Upfront Capital Preserved */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#F4F2EE]/50">
                  UPFRONT CAPITAL PRESERVED
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#F4F2EE] mt-1 tabular-numbers">
                  {formatINR(upfrontCapitalPreserved)}
                </div>
                <div className="text-[9px] font-mono text-[#C27D4B] mt-0.5">
                  ₹0 Capex Down Payment • Retained in Corporate Treasury
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <Link
              href={`/apply?category=${activeCategory}&asset=${activeAsset.slug}&qty=${quantity}&tenure=${tenure}`}
              className="w-full py-4 text-center font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-semibold hover:bg-[#D89564] transition-all duration-200 active:scale-[0.99] shadow-lg"
            >
              Lock Asset & Apply →
            </Link>
          </div>
        </div>
      </div>

      {/* Expandable Slide-Over Drawer: Specifications & Terms */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl bg-[#0E0F11] border-l border-[#C27D4B] h-full p-8 md:p-12 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#C27D4B]/20">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                    ASSET SPECIFICATION DOSSIER
                  </span>
                  <h3 className="font-sans text-2xl font-bold text-[#F4F2EE] mt-1">
                    {activeAsset.title}
                  </h3>
                  <div className="text-xs font-mono text-[#F4F2EE]/50 mt-0.5">
                    {activeAsset.subtitle}
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-[#F4F2EE]/60 hover:text-[#C27D4B] font-mono text-sm"
                  aria-label="Close dossier"
                >
                  [ESC ✕]
                </button>
              </div>

              {/* 6 Included Feature Bullets */}
              <div className="my-8">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C27D4B] block mb-4">
                  Included Manufacturer & Operating Features:
                </span>
                <ul className="space-y-3">
                  {activeAsset.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className="flex items-start gap-3 text-xs sm:text-sm text-[#F4F2EE]/85 font-sans leading-relaxed p-3 bg-[#17191D] border border-white/[0.04]"
                    >
                      <span className="text-[#C27D4B] font-mono text-xs">0{fIndex + 1}</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category Special Terms & SLA */}
              <div className="p-5 bg-[#17191D] border border-[#C27D4B]/30 mb-8">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#C27D4B] mb-2">
                  Operating Terms & SLA Governance
                </div>
                <p className="text-xs font-sans text-[#F4F2EE]/75 leading-relaxed">
                  {CATEGORIES[activeCategory].terms}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#C27D4B]/20 flex items-center justify-between gap-4">
              <Link
                href={`/apply?category=${activeCategory}&asset=${activeAsset.slug}&qty=${quantity}&tenure=${tenure}`}
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-3.5 text-center font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-semibold hover:bg-[#D89564]"
              >
                Proceed to Lease Application →
              </Link>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="py-3.5 px-6 font-mono text-xs uppercase tracking-wider border border-white/20 text-[#F4F2EE]/70 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
