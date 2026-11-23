'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WebGLLitStage from '@/components/WebGLLitStage';
import {
  ASSET_CATALOGUE,
  CATEGORIES,
  CategorySlug,
  AssetItem,
} from '@/data/catalogue';

export default function LeaseCataloguePage() {
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [inspectedAsset, setInspectedAsset] = useState<AssetItem | null>(null);

  // Filter and sort
  const filteredAssets = useMemo(() => {
    let result = ASSET_CATALOGUE;

    if (selectedCategory !== 'all') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.categoryLabel.toLowerCase().includes(q) ||
          a.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.monthlyRentINR - b.monthlyRentINR);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.monthlyRentINR - a.monthlyRentINR);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <main data-nav-theme="dark" className="relative min-h-screen bg-[#0E0F11] text-[#F4F2EE] selection:bg-[#C27D4B] selection:text-[#0E0F11]">
      <Navbar />

      {/* ========================================================
          HERO & FILTER HEADER
          ======================================================== */}
      <section data-nav-theme="dark" className="pt-28 pb-12 sm:pt-36 sm:pb-16 md:pt-44 md:pb-20 border-b border-[#C27D4B]/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C27D4B]" />
            <span>Corporate Portfolio // 24 Institutional Assets</span>
          </div>

          <h1 className="font-sans font-bold text-3xl sm:text-5xl md:text-7xl tracking-tighter text-[#F4F2EE] leading-[0.98]">
            Operating Lease Catalogue.
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base font-light text-[#F4F2EE]/75 max-w-2xl leading-relaxed">
            All 24 corporate assets are structured as true off-balance-sheet operating leases. Zero
            down payment, 100% tax-deductible operational expenditure under Section 37(1), and
            guaranteed 48-hour SLA deployment from our Ahmedabad hub.
          </p>

          {/* Interactive Category Filter Pills & Search */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-[#C27D4B]/20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6">
            {/* Category Buttons (Horizontally scrollable on mobile) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`py-2 px-3.5 sm:px-4 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-all border whitespace-nowrap min-h-[40px] flex items-center ${
                  selectedCategory === 'all'
                    ? 'bg-[#C27D4B] text-[#0E0F11] font-bold border-[#C27D4B]'
                    : 'bg-[#17191D] text-white/60 border-white/10 hover:border-[#C27D4B]/40 hover:text-white'
                }`}
              >
                All Portfolios (24)
              </button>

              {(['luxury-fleet', 'construction-warehouse', 'it-hardware'] as CategorySlug[]).map(
                (slug) => {
                  const cat = CATEGORIES[slug];
                  const isSel = selectedCategory === slug;
                  return (
                    <button
                      key={slug}
                      onClick={() => setSelectedCategory(slug)}
                      className={`py-2 px-3.5 sm:px-4 text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-all border whitespace-nowrap min-h-[40px] flex items-center ${
                        isSel
                          ? 'bg-[#C27D4B] text-[#0E0F11] font-bold border-[#C27D4B]'
                          : 'bg-[#17191D] text-white/60 border-white/10 hover:border-[#C27D4B]/40 hover:text-white'
                      }`}
                    >
                      {cat.name} (8)
                    </button>
                  );
                }
              )}
            </div>

            {/* Search and Sort */}
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search assets or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#17191D] border border-white/15 px-3.5 py-2 text-sm sm:text-xs font-mono text-[#F4F2EE] placeholder-white/40 focus:outline-none focus:border-[#C27D4B] transition-colors flex-1 sm:w-60 min-h-[40px]"
              />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'price-asc' | 'price-desc')}
                className="bg-[#17191D] border border-white/15 px-3 py-2 text-sm sm:text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B] cursor-pointer min-h-[40px]"
              >
                <option value="default">Default Sort</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ASSETS GRID (24 ASSETS)
          ======================================================== */}
      <section data-nav-theme="dark" className="py-12 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex items-center justify-between text-xs font-mono text-[#F4F2EE]/50 mb-8 pb-3 border-b border-white/[0.08]">
            <span>Showing {filteredAssets.length} of 24 Institutional Assets</span>
            <span className="text-[#C27D4B]">Ahmedabad Staging Hub</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-[#17191D] border border-white/[0.08] hover:border-[#C27D4B] transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* WebGL 2.5D Lit Stage */}
                  <div className="relative">
                    <WebGLLitStage
                      imageSrc={asset.imageSrc}
                      alt={asset.title}
                      assetTitle={asset.title}
                      assetCategory={asset.categoryLabel}
                      aspectRatio="16/10"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-[#0E0F11]/90 backdrop-blur-sm border border-[#C27D4B]/40 px-2 py-0.5 text-[9px] font-mono text-[#C27D4B] uppercase tracking-wider">
                      {asset.availability}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-6">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C27D4B] mb-1">
                      {asset.categoryLabel}
                    </div>

                    <h3 className="font-sans font-bold text-xl text-[#F4F2EE] group-hover:text-white transition-colors">
                      {asset.title}
                    </h3>
                    <p className="text-xs text-[#F4F2EE]/50 font-sans mt-0.5 mb-5">
                      {asset.subtitle}
                    </p>

                    {/* Price & Tenure */}
                    <div className="p-3.5 bg-[#0E0F11] border border-white/[0.06] flex items-baseline justify-between mb-5">
                      <div>
                        <div className="font-mono text-xl font-bold text-[#F4F2EE]">
                          {asset.monthlyRentFormatted}
                        </div>
                        <div className="text-[9px] font-mono text-[#F4F2EE]/40 uppercase">
                          Per Month + GST
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-[#C27D4B] font-medium">
                          {asset.tenureRange}
                        </div>
                        <div className="text-[9px] font-mono text-[#F4F2EE]/40 uppercase">
                          Tenure Window
                        </div>
                      </div>
                    </div>

                    {/* 6 Included Feature Bullets Preview */}
                    <div className="space-y-2 mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#F4F2EE]/40 block mb-2">
                        Included Specifications:
                      </span>
                      {asset.features.slice(0, 3).map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-start gap-2 text-xs text-[#F4F2EE]/75 font-sans leading-tight"
                        >
                          <span className="text-[#C27D4B] text-[10px] mt-0.5">■</span>
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expand Details Trigger */}
                    <button
                      onClick={() => setInspectedAsset(asset)}
                      className="text-[11px] font-mono text-[#C27D4B] hover:text-[#D89564] uppercase tracking-wider underline underline-offset-4"
                    >
                      View Specifications & Terms →
                    </button>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0 flex gap-3">
                  <Link
                    href={`/apply?category=${asset.category}&asset=${asset.slug}&qty=1&tenure=${asset.minTenureMonths}`}
                    className="flex-1 py-3 text-center text-xs font-mono uppercase tracking-[0.16em] bg-[#C27D4B] text-[#0E0F11] font-semibold hover:bg-[#D89564] transition-colors"
                  >
                    Configure / Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          INSPECT SPECIFICATIONS MODAL / DRAWER
          ======================================================== */}
      {inspectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-[#0E0F11] border border-[#C27D4B] p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#C27D4B]/20">
              <div>
                <span className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.2em]">
                  Asset Specifications & Terms
                </span>
                <h3 className="font-sans text-2xl font-bold text-[#F4F2EE] mt-1">
                  {inspectedAsset.title}
                </h3>
                <div className="text-xs font-mono text-[#F4F2EE]/60">
                  {inspectedAsset.subtitle} • {inspectedAsset.location}
                </div>
              </div>
              <button
                onClick={() => setInspectedAsset(null)}
                className="text-[#F4F2EE]/60 hover:text-[#C27D4B] font-mono text-sm p-1"
                aria-label="Close dossier"
              >
                [ESC ✕]
              </button>
            </div>

            {/* Pricing Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6 p-4 bg-[#17191D] border border-white/[0.06]">
              <div>
                <div className="text-[10px] font-mono text-[#F4F2EE]/50 uppercase">
                  Monthly Rent
                </div>
                <div className="font-mono text-xl font-bold text-[#C27D4B] mt-0.5">
                  {inspectedAsset.monthlyRentFormatted}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#F4F2EE]/50 uppercase">
                  Tenure Range
                </div>
                <div className="font-mono text-sm text-[#F4F2EE] font-medium mt-1">
                  {inspectedAsset.tenureRange}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-[10px] font-mono text-[#F4F2EE]/50 uppercase">
                  Fiscal Treatment
                </div>
                <div className="font-mono text-xs text-[#C27D4B] mt-1">
                  100% Tax-Deductible OPEX
                </div>
              </div>
            </div>

            {/* 6 Included Feature Bullets */}
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C27D4B] block mb-3">
                All 6 Included Technical Specifications:
              </span>
              <ul className="space-y-2.5">
                {inspectedAsset.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-xs sm:text-sm text-[#F4F2EE]/85 font-sans leading-relaxed p-3 bg-[#17191D] border border-white/[0.04]"
                  >
                    <span className="text-[#C27D4B] font-mono text-xs">0{idx + 1}</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Category Special Terms & SLA */}
            <div className="p-4 bg-[#17191D] border border-[#C27D4B]/30 mb-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C27D4B] mb-1">
                Category SLA & Replacement Terms
              </div>
              <p className="text-xs font-sans text-[#F4F2EE]/75 leading-relaxed">
                {CATEGORIES[inspectedAsset.category].terms}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#C27D4B]/20 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={`/apply?category=${inspectedAsset.category}&asset=${inspectedAsset.slug}&qty=1&tenure=${inspectedAsset.minTenureMonths}`}
                onClick={() => setInspectedAsset(null)}
                className="w-full sm:w-auto flex-1 py-3 px-6 bg-[#C27D4B] text-[#0E0F11] font-mono text-xs uppercase tracking-[0.2em] font-semibold text-center hover:bg-[#D89564] transition-colors"
              >
                Proceed to Lease Application →
              </Link>
              <button
                onClick={() => setInspectedAsset(null)}
                className="w-full sm:w-auto py-3 px-6 border border-white/20 text-[#F4F2EE]/70 font-mono text-xs uppercase tracking-[0.2em] hover:text-[#F4F2EE]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
