'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import DaylightShaderBackground from '@/components/DaylightShaderBackground';

gsap.registerPlugin(ScrollTrigger);

const milestones = [
  {
    step: '01',
    time: 'Day 1',
    title: 'Apply Online',
    desc: 'Digital asset selection, tenure specification & basic entity details in under 5 minutes.',
  },
  {
    step: '02',
    time: 'Day 1',
    title: 'AI Due Diligence',
    desc: 'Automated GST, MCA & bank statement scoring with instantaneous credit underwriting.',
  },
  {
    step: '03',
    time: 'Day 2',
    title: 'Lease Proposal',
    desc: 'Binding term sheet issued within 4 working hours with zero hidden financial covenants.',
  },
  {
    step: '04',
    time: 'Day 2–3',
    title: 'Aadhaar eSign & eNACH',
    desc: '100% paperless execution with digital stamp duty adjudication and mandate activation.',
  },
  {
    step: '05',
    time: 'Day 3–5',
    title: 'Asset Delivered',
    desc: 'Physical white-glove handover from Ahmedabad/Changodar hub with active telematics.',
  },
];

const institutionalBadges = [
  'Axis Bank Approved',
  'HDFC Bank Partner',
  'Tata Capital Empanelled',
  'CIBIL Integrated',
  'DigiLocker KYC',
  'eNACH Enabled',
  'GST & IND AS Compliant',
  'SARFAESI Protected',
];

export default function Act4Velocity() {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineSvgRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = timelineSvgRef.current;
      if (!path) return;

      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'center center',
          scrub: 0.3,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-[#F4F2EE] text-[#0E0F11] select-none"
      id="timeline"
      data-nav-theme="light"
    >
      <DaylightShaderBackground className="w-full" intensity={0.75}>
        {/* ========================================================
            PART 1: 48-HOUR VELOCITY TIMELINE
            ======================================================== */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 md:py-32">
          {/* Eyebrow & Title */}
          <div className="max-w-3xl mb-16">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-[#C27D4B]" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                DEPLOYMENT TIMELINE
              </span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#0E0F11] leading-tight">
              48-Hour Deployment Velocity.
            </h2>
            <p className="mt-4 text-sm sm:text-base font-normal text-[#0E0F11]/75 leading-relaxed">
              Traditional banking and leasing channels require 4 to 12 weeks of bureaucratic underwriting.
              Firstgen Assets executes end-to-end lease origination in days through algorithmic diligence.
            </p>
          </div>

          {/* Desktop Horizontal Scrubbed Timeline with SVG Line */}
          <div className="relative mt-12 mb-20 hidden md:block">
            {/* SVG Connector Line */}
            <svg
              className="absolute top-6 left-0 w-full h-8 pointer-events-none z-0"
              viewBox="0 0 1000 24"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Background guide rail */}
              <line x1="0" y1="12" x2="1000" y2="12" stroke="rgba(14, 15, 17, 0.12)" strokeWidth="1" />
              {/* Animated scrubbed copper line */}
              <path
                ref={timelineSvgRef}
                d="M 0 12 L 1000 12"
                stroke="#C27D4B"
                strokeWidth="2"
              />
            </svg>

            {/* 5 Milestone Cards */}
            <div className="grid grid-cols-5 gap-6 relative z-10">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  {/* Top Node Indicator */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-5 h-5 rounded-full bg-[#FAF9F6] border-2 border-[#C27D4B] flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C27D4B]" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#C27D4B]">
                      {m.step} · {m.time}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="bg-[#FAF9F6] border border-[#0E0F11]/12 p-5 flex flex-col justify-between h-[180px]">
                    <div>
                      <h4 className="font-sans font-semibold text-sm text-[#0E0F11]">
                        {m.title}
                      </h4>
                      <p className="mt-2 text-xs font-sans text-[#0E0F11]/70 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                    <div className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-wider">
                      Gujarat SLA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Vertical Milestone Stack */}
          <div className="md:hidden space-y-4 mb-16">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#FAF9F6] border border-[#0E0F11]/12 p-5 relative pl-6 border-l-4 border-l-[#C27D4B]"
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#C27D4B] mb-1">
                  <span>{m.step} · {m.time}</span>
                  <span className="text-[#0E0F11]/40 uppercase tracking-widest text-[10px]">Step {idx + 1}</span>
                </div>
                <h4 className="font-sans font-semibold text-base text-[#0E0F11]">{m.title}</h4>
                <p className="mt-1 text-xs text-[#0E0F11]/70 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* ========================================================
              PART 2: FOUNDER'S NOTE
              ======================================================== */}
          <div className="my-20 p-8 sm:p-12 md:p-16 bg-[#FAF9F6] border border-[#0E0F11]/15 relative overflow-hidden">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                <span className="w-1.5 h-1.5 bg-[#C27D4B]" />
                <span>Founder&apos;s Perspective</span>
              </div>

              <blockquote className="font-sans text-xl sm:text-2xl md:text-3xl font-light text-[#0E0F11] leading-relaxed tracking-tight italic">
                &ldquo;True wealth is measured not by what you possess, but by what you enable. Firstgen
                Assets exists to enable — to place the right asset in the right hands at the right time,
                and to let the business do what it was built to do.&rdquo;
              </blockquote>

              <div className="pt-4 border-t border-[#0E0F11]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[#0E0F11]/70">
                <div>
                  <span className="font-bold text-[#0E0F11] text-sm font-sans not-italic">Kartik</span>
                  <span className="mx-2">·</span>
                  <span>Founder, Firstgen Assets Private Limited</span>
                </div>
                <div className="text-[#C27D4B] tracking-wider uppercase">
                  Ahmedabad, Gujarat
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              PART 3: QUIET STATIC MONOCHROME INSTITUTIONAL GRID
              (Strictly NO scrolling ticker)
              ======================================================== */}
          <div className="mt-16">
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#0E0F11]/50">
                Institutional Integration & Compliance Standards
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {institutionalBadges.map((badge, bIdx) => (
                <div
                  key={bIdx}
                  className="bg-[#FAF9F6] border border-[#0E0F11]/10 py-3.5 px-4 text-center text-xs font-mono text-[#0E0F11]/80 uppercase tracking-wider hover:border-[#C27D4B]/40 transition-colors"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            PART 4: ARCHITECTURAL FOOTER
            ======================================================== */}
        <footer className="w-full border-t border-[#0E0F11]/12 bg-[#F4F2EE]">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 lg:py-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* Col 1: Company Info with firstgen-logo-transparent.png on Limestone */}
              <div className="md:col-span-4 flex flex-col gap-4">
                <div className="relative w-44 h-11">
                  <Image
                    src="/images/firstgen-logo-transparent.png"
                    alt="Firstgen Assets Private Limited"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <p className="text-xs font-sans text-[#0E0F11]/75 leading-relaxed max-w-sm">
                  Firstgen Assets Private Limited is an institutional operating lease platform based in
                  Ahmedabad, Gujarat. We structure high-value corporate capital deployments across luxury
                  fleets, heavy machinery, and enterprise IT hardware.
                </p>
                <div className="text-xs font-mono text-[#0E0F11]/80 space-y-1 pt-2">
                  <div className="text-[#C27D4B] font-semibold">leasing@firstgenassets.in</div>
                  <div>Firstgen Tower, Floor 8, SG Highway</div>
                  <div>Ahmedabad, Gujarat 380054, India</div>
                  <div>+91 (079) 4800 2400</div>
                </div>
              </div>

              {/* Col 2: Assets */}
              <div className="md:col-span-3 flex flex-col gap-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0E0F11]/50">
                  Asset Verticals
                </span>
                <ul className="space-y-2 text-xs font-sans text-[#0E0F11]/85">
                  <li>
                    <Link href="/lease?cat=luxury-fleet" className="hover:text-[#C27D4B] transition-colors">
                      Executive Luxury Fleet (Rolls-Royce, S-Class)
                    </Link>
                  </li>
                  <li>
                    <Link href="/lease?cat=construction-warehouse" className="hover:text-[#C27D4B] transition-colors">
                      Heavy Cranes & Excavators (40T, Komatsu)
                    </Link>
                  </li>
                  <li>
                    <Link href="/lease?cat=construction-warehouse" className="hover:text-[#C27D4B] transition-colors">
                      Warehouse & Intralogistics (Toyota Forklifts)
                    </Link>
                  </li>
                  <li>
                    <Link href="/lease?cat=it-hardware" className="hover:text-[#C27D4B] transition-colors">
                      Enterprise Compute (Dell PowerEdge R750)
                    </Link>
                  </li>
                  <li>
                    <Link href="/lease?cat=it-hardware" className="hover:text-[#C27D4B] transition-colors">
                      Workforce Hardware (MacBook Pro M4 Fleet)
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Services */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0E0F11]/50">
                  Services
                </span>
                <ul className="space-y-2 text-xs font-sans text-[#0E0F11]/85">
                  <li>Operating Leases</li>
                  <li>Sale & Leaseback</li>
                  <li>Fleet Governance</li>
                  <li>Sec 37(1) Advisory</li>
                  <li>NIST 800-88 Purge</li>
                </ul>
              </div>

              {/* Col 4: Company */}
              <div className="md:col-span-3 flex flex-col gap-3">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#0E0F11]/50">
                  Company
                </span>
                <ul className="space-y-2 text-xs font-sans text-[#0E0F11]/85">
                  <li>
                    <Link href="/about" className="hover:text-[#C27D4B] transition-colors">
                      About Firstgen Assets
                    </Link>
                  </li>
                  <li>
                    <Link href="/lease" className="hover:text-[#C27D4B] transition-colors">
                      24-Asset Catalogue
                    </Link>
                  </li>
                  <li>
                    <Link href="/apply" className="hover:text-[#C27D4B] transition-colors">
                      Begin Lease Application
                    </Link>
                  </li>
                  <li>
                    <Link href="/verify" className="hover:text-[#C27D4B] transition-colors">
                      Document Verification
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Legal Bottom Line */}
            <div className="mt-12 pt-8 border-t border-[#0E0F11]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#0E0F11]/60">
              <div>
                © 2025 Firstgen Assets Private Limited · Governed by Indian Law · Subject to Ahmedabad Jurisdiction
              </div>
              <div className="flex items-center gap-4">
                <span>CIN: U65929GJ2024PTC149821</span>
                <span>•</span>
                <span>GSTIN: 24AAACF1234A1Z5</span>
              </div>
            </div>
          </div>
        </footer>
      </DaylightShaderBackground>
    </section>
  );
}
