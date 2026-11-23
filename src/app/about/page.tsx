'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DaylightShaderBackground from '@/components/DaylightShaderBackground';

export default function AboutPage() {
  const positioningPillars = [
    {
      num: '01',
      title: 'Off-Balance Sheet Capital Purity',
      subtitle: 'Ind AS 116 & Sec 37(1) Deductibility',
      desc: 'Traditional bank loans encumber corporate balance sheets with debt covenants and slow depreciation schedules. Firstgen structures pure operating leases where 100% of rental payments qualify as direct operational expense deductions.',
    },
    {
      num: '02',
      title: 'Zero Residual & Obsolescence Risk',
      subtitle: '100% Asset Risk Borne by Firstgen',
      desc: 'Rapid technological evolution and tighter emission norms create heavy balance-sheet write-downs. Firstgen absorbs 100% of residual value, salvage discounting, and secondary market auction volatility.',
    },
    {
      num: '03',
      title: 'Institutional 48-Hour Velocity',
      subtitle: 'Fast Credit Evaluation',
      desc: 'By integrating direct MCA registries, GST analysis, and automated bank statement processing, Firstgen issues binding term sheets in 4 working hours and dispatches physical assets within 48 hours.',
    },
    {
      num: '04',
      title: 'Comprehensive Lifecycle Care',
      subtitle: 'Zero Downtime SLAs & Replacement',
      desc: 'Every lease incorporates OEM preventative maintenance, dedicated on-site field technicians, 24/7 telematics monitoring, and guaranteed priority replacement units to ensure business continuity.',
    },
  ];

  const coreValues = [
    {
      title: 'Speed without compromise.',
      desc: 'We move with the relentless velocity of the modern enterprise, but never bypass statutory diligence or legal precision.',
    },
    {
      title: 'Transparency without exception.',
      desc: 'Our term sheets contain zero hidden clauses, zero balloon surprises, and zero ambiguous end-of-term penalties.',
    },
    {
      title: 'Technology without complexity.',
      desc: 'From eSign execution to IoT telematics, technology exists to streamline execution, not to create operational friction.',
    },
    {
      title: 'Relationships without pretence.',
      desc: 'Swiss private-banking discretion combined with Gujarat’s foundational ethos: our word is our bond, backed by structural capital.',
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#0E0F11] text-[#0E0F11] selection:bg-[#C27D4B] selection:text-[#0E0F11]">
      {/* Navigation */}
      <Navbar />

      {/* ========================================================
          1. HERO SECTION (Architectural Limestone)
          ======================================================== */}
      <div data-nav-theme="light">
        <DaylightShaderBackground className="relative pt-36 pb-24 md:pt-44 md:pb-32 border-b border-[#0E0F11]/10 overflow-hidden text-[#0E0F11]">
          <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#C27D4B]" />
              <span>Ahmedabad · Gujarat · Corporate Headquarters</span>
            </div>

            <h1 className="font-sans font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter text-[#0E0F11] leading-[0.95] max-w-5xl">
              Built in Ahmedabad.
              <br />
              <span className="text-[#C27D4B] font-light">Serving India&apos;s Ambition.</span>
            </h1>

            <div className="mt-10 pt-10 border-t border-[#0E0F11]/12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-7 text-base sm:text-lg font-light text-[#0E0F11]/80 leading-relaxed font-sans">
                Firstgen Assets Private Limited was founded on a singular economic conviction: modern
                enterprises should allocate precious equity capital toward core expansion, talent, and market
                leadership—never toward immobilizing physical assets that depreciate with time.
              </div>
              <div className="md:col-span-5 bg-[#FAF9F6] p-6 border border-[#0E0F11]/12 text-xs font-mono text-[#0E0F11]/80 space-y-2">
                <div className="text-[10px] text-[#C27D4B] uppercase tracking-widest font-semibold">
                  Corporate Registration
                </div>
                <div className="font-semibold text-[#0E0F11]">Firstgen Assets Private Limited</div>
                <div>CIN: U65929GJ2024PTC149821</div>
                <div>Registered with ROC Gujarat, Ministry of Corporate Affairs</div>
                <div className="text-[#C27D4B] pt-2 font-medium">• SG Highway Financial Corridor, Ahmedabad</div>
              </div>
            </div>
          </div>
        </DaylightShaderBackground>
      </div>

      {/* ========================================================
          2. MISSION & VISION (Warm Obsidian)
          ======================================================== */}
      <section data-nav-theme="dark" className="py-24 md:py-32 bg-[#0E0F11] border-b border-[#C27D4B]/20 text-[#F4F2EE]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {/* Mission */}
            <div className="bg-[#17191D] border border-white/[0.08] p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                  Our Mandate
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-[#F4F2EE] mt-2 mb-4">
                  The Mission
                </h2>
                <p className="text-sm sm:text-base font-sans text-[#F4F2EE]/75 leading-relaxed">
                  To liberate Indian enterprises from dead capital, enabling limitless operational
                  velocity through structured operating lease infrastructure for luxury corporate
                  fleets, heavy industrial machinery, and enterprise IT computing arrays.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.08] text-xs font-mono text-[#C27D4B]">
                • Capital Liberation for High-Growth Enterprises
              </div>
            </div>

            {/* Vision */}
            <div className="bg-[#17191D] border border-white/[0.08] p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                  Horizon 2030
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-[#F4F2EE] mt-2 mb-4">
                  The Vision
                </h2>
                <p className="text-sm sm:text-base font-sans text-[#F4F2EE]/75 leading-relaxed">
                  To become India&apos;s preeminent non-banking operating asset partner, deploying and managing
                  ₹5,000+ Crore in mission-critical corporate physical infrastructure with zero debt covenants,
                  zero residual friction, and guaranteed 48-hour replacement SLAs.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/[0.08] text-xs font-mono text-[#C27D4B]">
                • ₹5,000+ Cr Operating Assets Under Management
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. 4 POSITIONING PILLARS (Architectural Limestone)
          ======================================================== */}
      <div data-nav-theme="light">
        <DaylightShaderBackground className="py-24 md:py-32 border-b border-[#0E0F11]/10 text-[#0E0F11]">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
                Operating Capital Strategy
              </span>
              <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-semibold text-[#0E0F11] tracking-tight mt-2">
                Four Positioning Pillars.
              </h2>
              <p className="mt-3 text-sm font-sans text-[#0E0F11]/70">
                How our operating lease model protects company cash flow while providing immediate access to critical equipment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {positioningPillars.map((pillar) => (
                <div
                  key={pillar.num}
                  className="bg-[#FAF9F6] border border-[#0E0F11]/12 p-8 sm:p-10 flex flex-col justify-between hover:border-[#C27D4B]/60 transition-colors shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#C27D4B] mb-4">
                      <span>PILLAR {pillar.num}</span>
                      <span className="text-[#0E0F11]/50">{pillar.subtitle}</span>
                    </div>
                    <h3 className="font-sans text-xl sm:text-2xl font-semibold text-[#0E0F11] mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-sm font-sans text-[#0E0F11]/75 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[#0E0F11]/10 text-[11px] font-mono text-[#C27D4B] uppercase tracking-wider">
                    Verified Operating Lease Structure
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DaylightShaderBackground>
      </div>

      {/* ========================================================
          4. 4 NON-NEGOTIABLE VALUES (Warm Obsidian)
          ======================================================== */}
      <section data-nav-theme="dark" className="py-24 md:py-32 bg-[#0E0F11] border-b border-[#C27D4B]/20 text-[#F4F2EE]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B]">
              Operating Principles
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-semibold text-[#F4F2EE] tracking-tight mt-2">
              Four Non-Negotiable Values.
            </h2>
            <p className="mt-3 text-sm font-sans text-[#F4F2EE]/70">
              The clear standards that govern every client interaction, agreement, and asset delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="bg-[#17191D] border border-white/[0.08] p-6 flex flex-col justify-between h-[240px] hover:border-[#C27D4B]/40 transition-colors"
              >
                <div>
                  <span className="text-xs font-mono text-[#C27D4B] uppercase tracking-wider">
                    0{idx + 1} · PRINCIPLE
                  </span>
                  <h3 className="font-sans text-lg font-semibold text-[#F4F2EE] mt-2 mb-3">
                    {val.title}
                  </h3>
                  <p className="text-xs font-sans text-[#F4F2EE]/75 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/[0.06] text-[10px] font-mono text-white/40 uppercase">
                  Institutional Standard
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          5. FOUNDER'S NOTE (Warm Obsidian)
          ======================================================== */}
      <section data-nav-theme="dark" className="py-24 md:py-32 bg-[#0E0F11] border-b border-[#C27D4B]/20 text-[#F4F2EE]">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <div className="bg-[#17191D] border border-[#C27D4B]/30 p-8 sm:p-12 md:p-16 shadow-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B] block mb-6">
              A Personal Note from the Founder
            </span>

            <blockquote className="font-sans text-xl sm:text-2xl md:text-3xl font-light text-[#F4F2EE] leading-relaxed tracking-tight italic">
              &ldquo;True wealth is measured not by what you possess, but by what you enable. Firstgen
              Assets exists to enable — to place the right asset in the right hands at the right time,
              and to let the business do what it was built to do.&rdquo;
            </blockquote>

            <p className="mt-8 text-sm sm:text-base font-light text-[#F4F2EE]/75 leading-relaxed font-sans">
              In an era where capital costs dictate survival, holding capital prisoner in heavy iron or
              rapidly depreciating computer servers is an unnecessary tax on ambition. By separating asset
              utility from asset ownership, we allow India&apos;s visionary builders to move at the speed of
              opportunity.
            </p>

            <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#F4F2EE]/70">
              <div>
                <span className="font-bold text-[#F4F2EE] text-base font-sans not-italic">Kartik</span>
                <span className="mx-2">·</span>
                <span>Founder, Firstgen Assets Private Limited</span>
              </div>
              <div className="text-[#C27D4B] uppercase tracking-wider">
                Ahmedabad, Gujarat, India
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
