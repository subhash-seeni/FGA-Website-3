'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer data-nav-theme="light" className="w-full bg-[#F4F2EE] text-[#0E0F11] border-t border-[#0E0F11]/10 selection:bg-[#0E0F11] selection:text-[#F4F2EE]">
      {/* Top Architectural Banner */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 lg:py-20 border-b border-[#0E0F11]/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Brand & Mission on Limestone with authentic firstgen-logo-transparent.png */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative w-48 h-12">
              <Image
                src="/images/firstgen-logo-transparent.png"
                alt="Firstgen Assets Private Limited"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm font-sans text-[#0E0F11]/75 leading-relaxed max-w-md">
              Firstgen Assets Private Limited is an institutional operating lease platform based in
              Ahmedabad, Gujarat. We structure high-value corporate capital deployments across luxury
              fleets, heavy infrastructure machinery, and enterprise IT computing arrays under true
              off-balance-sheet operating leases.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-[#C27D4B] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C27D4B]" />
              <span>Ahmedabad • GIFT City • Mumbai • NCR</span>
            </div>
          </div>

          {/* Quick Columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Asset Portfolios */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0E0F11]/50">
                Asset Categories
              </span>
              <ul className="flex flex-col gap-2 text-sm text-[#0E0F11]/85">
                <li>
                  <Link href="/lease?category=luxury-fleet" className="hover:text-[#C27D4B] transition-colors">
                    Executive Luxury Fleet
                  </Link>
                </li>
                <li>
                  <Link href="/lease?category=construction-warehouse" className="hover:text-[#C27D4B] transition-colors">
                    Heavy Construction & Cranes
                  </Link>
                </li>
                <li>
                  <Link href="/lease?category=construction-warehouse" className="hover:text-[#C27D4B] transition-colors">
                    Warehouse & Intralogistics
                  </Link>
                </li>
                <li>
                  <Link href="/lease?category=it-hardware" className="hover:text-[#C27D4B] transition-colors">
                    Enterprise IT Clusters
                  </Link>
                </li>
                <li>
                  <Link href="/lease?category=it-hardware" className="hover:text-[#C27D4B] transition-colors">
                    Workforce Hardware Packs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Governance & Tax */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0E0F11]/50">
                Capital Governance
              </span>
              <ul className="flex flex-col gap-2 text-sm text-[#0E0F11]/85">
                <li>
                  <span className="font-mono text-xs text-[#C27D4B]">Sec. 37(1)</span> IT Act Deduction
                </li>
                <li>
                  <span className="font-mono text-xs text-[#C27D4B]">Ind AS 116</span> Compliance
                </li>
                <li>
                  <span>48-Hour SLA Replacement</span>
                </li>
                <li>
                  <span>Zero Capex Debt Covenants</span>
                </li>
                <li>
                  <span>Certified Data Erasure NIST 800-88</span>
                </li>
              </ul>
            </div>

            {/* Headquarters & Contacts */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0E0F11]/50">
                Ahmedabad Registry
              </span>
              <div className="text-xs font-mono text-[#0E0F11]/80 leading-relaxed flex flex-col gap-1.5">
                <span>Firstgen Tower, Floor 8</span>
                <span>SG Highway Financial Corridor</span>
                <span>Ahmedabad, Gujarat 380054</span>
                <span className="mt-2 text-[#C27D4B]">+91 (079) 4800 2400</span>
                <span className="text-[#0E0F11]/60">leases@firstgenassets.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Band */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#0E0F11]/60">
        <div className="flex items-center gap-4 flex-wrap">
          <span>© {new Date().getFullYear()} Firstgen Assets Private Limited. All Rights Reserved.</span>
          <span className="hidden sm:inline">•</span>
          <span>CIN: U65929GJ2024PTC149821</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-[#C27D4B] transition-colors">
            Operating Terms
          </Link>
          <Link href="/about" className="hover:text-[#C27D4B] transition-colors">
            Corporate Disclosures
          </Link>
          <span className="text-[#0E0F11]/50">
            GSTIN: 24AAACF1234A1Z5
          </span>
        </div>
      </div>
    </footer>
  );
}
