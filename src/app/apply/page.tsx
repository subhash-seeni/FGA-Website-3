'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ASSET_CATALOGUE, CATEGORIES, CategorySlug, AssetItem } from '@/data/catalogue';
import { getAssetPath } from '@/lib/basePath';
import { runCreditAssessment } from '@/lib/creditAssessmentEngine';

interface CreditScorecard {
  overallScore: number;
  riskGrade: string;
  recommendation: 'APPROVE' | 'CONDITIONAL' | 'REJECT';
  approvedMonthlyLeaseINR: number;
  approvedTenureMonths: number;
  securityDeposit: string;
  metrics: {
    businessViability: number;
    cashFlowAdequacy: number;
    documentCompleteness: number;
    obligorQuality: number;
  };
  conditions: string[];
  redFlags: string[];
  officerSummary: string;
  nextSteps: string[];
}

function FiveStepApplicationInner() {
  const searchParams = useSearchParams();

  // Active step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State - Step 1: Business Details
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyPan, setCompanyPan] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [industry, setIndustry] = useState('EPC & Infrastructure');
  const [constitution, setConstitution] = useState('Private Limited');
  const [yearsInBusiness, setYearsInBusiness] = useState('5–10');
  const [address, setAddress] = useState('');

  // Form State - Step 2: Asset Selection
  const [category, setCategory] = useState<CategorySlug>('luxury-fleet');
  const [assetSlug, setAssetSlug] = useState('rolls-royce-ghost');
  const [quantity, setQuantity] = useState(1);
  const [tenure, setTenure] = useState(36);
  const [purposeOfLease, setPurposeOfLease] = useState('Corporate Executive Fleet / Headquarter Protocol');

  // Form State - Step 3: Financial Info
  const [annualTurnover, setAnnualTurnover] = useState('150000000'); // 15 Cr default
  const [netProfit, setNetProfit] = useState('18000000'); // 1.8 Cr default
  const [primaryBank, setPrimaryBank] = useState('HDFC Bank');
  const [yearsWithBank, setYearsWithBank] = useState('3–5');
  const [cibilScore, setCibilScore] = useState(765);
  const [existingObligations, setExistingObligations] = useState('250000');

  // Form State - Step 4: Document Checklist
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    gstCert: true,
    companyPanDoc: true,
    itr2Years: true,
    bankStatements12m: true,
    moaAoaDeed: true,
    directorAadhaar: true,
    officeRentUtility: true,
    premisesPhotos: false,
  });

  // Form State - Step 5: Review & Consent
  const [consentChecked, setConsentChecked] = useState(false);

  // Execution & Scorecard State
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [scorecard, setScorecard] = useState<CreditScorecard | null>(null);
  const [docketNumber, setDocketNumber] = useState<string>('');

  // Read URL query parameters on mount
  useEffect(() => {
    const qCat = searchParams.get('category') as CategorySlug | null;
    const qAsset = searchParams.get('asset');
    const qQty = searchParams.get('qty');
    const qTenure = searchParams.get('tenure');

    if (qCat && (qCat === 'luxury-fleet' || qCat === 'construction-warehouse' || qCat === 'it-hardware')) {
      setCategory(qCat);
    }
    if (qAsset) {
      const match = ASSET_CATALOGUE.find((a) => a.slug === qAsset);
      if (match) {
        setAssetSlug(match.slug);
        setCategory(match.category);
      }
    }
    if (qQty) {
      const parsedQty = parseInt(qQty, 10);
      if (!isNaN(parsedQty) && parsedQty >= 1 && parsedQty <= 50) {
        setQuantity(parsedQty);
      }
    }
    if (qTenure) {
      const parsedTenure = parseInt(qTenure, 10);
      if (!isNaN(parsedTenure)) {
        setTenure(parsedTenure);
      }
    }
  }, [searchParams]);

  // Selected asset metadata
  const currentAsset: AssetItem = useMemo(() => {
    const found = ASSET_CATALOGUE.find((a) => a.slug === assetSlug);
    return found || ASSET_CATALOGUE[0];
  }, [assetSlug]);

  // Filtered assets by category
  const categoryAssets = useMemo(() => {
    return ASSET_CATALOGUE.filter((a) => a.category === category);
  }, [category]);

  // Validations
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const isGstinValid = gstin.trim() === '' || gstinRegex.test(gstin.trim().toUpperCase());
  const isPanValid = companyPan.trim() === '' || panRegex.test(companyPan.trim().toUpperCase());

  // Step 1 readiness check
  const isStep1Valid =
    companyName.trim() !== '' &&
    gstin.trim() !== '' &&
    gstinRegex.test(gstin.trim().toUpperCase()) &&
    companyPan.trim() !== '' &&
    panRegex.test(companyPan.trim().toUpperCase()) &&
    directorName.trim() !== '' &&
    mobileNumber.trim().length >= 10 &&
    email.trim() !== '' &&
    address.trim() !== '';

  // Calculation helpers
  const tenureRangeSpan = Math.max(1, currentAsset.maxTenureMonths - currentAsset.minTenureMonths);
  const tenureProgress = (tenure - currentAsset.minTenureMonths) / tenureRangeSpan;
  const tenureEfficiency = 1.0 - tenureProgress * 0.08;
  const estimatedMonthlyLease = Math.round(currentAsset.monthlyRentINR * quantity * tenureEfficiency);
  const upfrontCapitalPreserved = Math.round(currentAsset.monthlyRentINR * 32 * quantity);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Submit assessment handler
  const handleRunAssessment = async () => {
    if (!consentChecked) {
      alert('Please confirm consent checkbox to authorize CIBIL and regulatory checks.');
      return;
    }

    setIsLoading(true);
    setAuditLogs([]);

    const logMessages = [
      'INITIALIZING ENCRYPTED MCA & CBIC REGISTRY GATEWAY...',
      `CROSS-REFERENCING GSTIN: ${gstin.toUpperCase()} [STATE JURISDICTION: GUJARAT]...`,
      `VERIFYING NSDL CORPORATE PAN RECORD: ${companyPan.toUpperCase()}...`,
      'RETRIEVING CIBIL COMMERCIAL OBLIGOR PROFILE & DEBT REPAYMENT TRACK...',
      'CALCULATING CASH FLOW ADEQUACY RATIO UNDER IND AS 116...',
      `APPLYING FIRSTGEN RISK MODEL FOR ${quantity} UNIT(S) OF ${currentAsset.title.toUpperCase()}...`,
      'GENERATING BINDING STATUTORY LEASE SCORECARD...',
    ];

    // Simulate animated terminal progression
    for (let i = 0; i < logMessages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 380));
      setAuditLogs((prev) => [...prev, logMessages[i]]);
    }

    const payload = {
      businessDetails: {
        companyName,
        gstin: gstin.toUpperCase(),
        companyPan: companyPan.toUpperCase(),
        directorName,
        mobileNumber,
        email,
        city,
        industry,
        constitution,
        yearsInBusiness,
        address,
      },
      assetSelection: {
        category,
        assetSlug,
        assetTitle: currentAsset.title,
        quantity,
        tenureMonths: tenure,
        purpose: purposeOfLease,
        estimatedMonthly: estimatedMonthlyLease,
      },
      financialInfo: {
        annualTurnover,
        netProfit,
        primaryBank,
        yearsWithBank,
        cibilScore,
        existingObligations,
      },
      documentChecklist: checklist,
    };

    try {
      const response = await fetch(getAssetPath('/api/credit-assessment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.scorecard) {
          setScorecard(data.scorecard);
          setDocketNumber(data.docketNumber);
          return;
        }
      }
      // If serverless API is unavailable (static export / GitHub Pages), run client-side underwriting
      const localData = runCreditAssessment(payload);
      setScorecard(localData.scorecard);
      setDocketNumber(localData.docketNumber);
    } catch {
      // Offline / Static export fallback
      const localData = runCreditAssessment(payload);
      setScorecard(localData.scorecard);
      setDocketNumber(localData.docketNumber);
    } finally {
      setIsLoading(false);
    }
  };

  const stepsList = [
    { num: '01', title: 'Business Details' },
    { num: '02', title: 'Asset Selection' },
    { num: '03', title: 'Financial Info' },
    { num: '04', title: 'Document Checklist' },
    { num: '05', title: 'Review & Submit' },
  ];

  return (
    <div className="w-full">
      {/* Monospace Step Progress Bar */}
      <div className="mb-12 border border-[#C27D4B]/30 bg-[#17191D] p-3 sm:p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px] text-xs font-mono">
          {stepsList.map((step, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <button
                key={step.num}
                onClick={() => {
                  if (isCompleted || isActive) setCurrentStep(stepNum);
                }}
                disabled={!isCompleted && !isActive}
                className={`flex items-center gap-2 px-3 py-2 transition-all ${
                  isActive
                    ? 'bg-[#C27D4B] text-[#0E0F11] font-bold shadow-md'
                    : isCompleted
                    ? 'text-[#C27D4B] hover:text-white cursor-pointer'
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <span>{step.num}</span>
                <span>{step.title}</span>
                {isCompleted && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terminal View: While Loading */}
      {isLoading && (
        <div className="bg-[#17191D] border border-[#C27D4B] p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="flex items-center gap-3 text-xs font-mono text-[#C27D4B] uppercase tracking-widest mb-6">
            <span className="w-2.5 h-2.5 bg-[#C27D4B] animate-pulse" />
            <span>Credit Assessment & Verification in Progress...</span>
          </div>

          <div className="bg-[#0E0F11] border border-white/10 p-6 font-mono text-xs text-[#F4F2EE]/85 space-y-2.5 min-h-[220px]">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#C27D4B]">[T+{(idx * 0.4).toFixed(1)}s]</span>
                <span className="text-white/90">{log}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[#C27D4B] animate-pulse pt-2">
              <span>_</span>
              <span>COMPUTING CREDIT PROFILE</span>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Credit Decision Scorecard Output */}
      {scorecard && !isLoading && (
        <div className="bg-[#17191D] border border-[#C27D4B] p-6 sm:p-10 mb-16 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C27D4B]/20">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.25em]">
                <span>FIRSTGEN LEASE SUMMARY // {docketNumber}</span>
              </div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-[#F4F2EE] mt-1">
                Credit Decision Scorecard
              </h2>
              <div className="text-xs font-mono text-[#F4F2EE]/60 mt-0.5">
                Applicant: {companyName} • GSTIN: {gstin.toUpperCase()}
              </div>
            </div>

            {/* Recommendation Badge */}
            <div className="flex items-center gap-4">
              <div
                className={`px-5 py-2.5 text-xs font-mono font-bold tracking-[0.2em] uppercase border ${
                  scorecard.recommendation === 'APPROVE'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80'
                    : scorecard.recommendation === 'CONDITIONAL'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/80'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/80'
                }`}
              >
                {scorecard.recommendation}
              </div>

              <div className="text-right">
                <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">Risk Grade</div>
                <div className="font-mono text-2xl font-bold text-[#C27D4B]">{scorecard.riskGrade}</div>
              </div>
            </div>
          </div>

          {/* Key Metrics & Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-8 items-center">
            {/* Overall Score Dial */}
            <div className="md:col-span-4 bg-[#0E0F11] border border-[#C27D4B]/30 p-6 text-center flex flex-col justify-center items-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#F4F2EE]/50 mb-2">
                Aggregate Firstgen Score
              </div>
              <div className="font-mono text-5xl sm:text-6xl font-bold text-[#F4F2EE]">
                {scorecard.overallScore}
                <span className="text-xl text-[#C27D4B] font-light">/100</span>
              </div>
              <div className="text-[10px] font-mono text-[#C27D4B] mt-2 uppercase tracking-wider">
                Ind AS 116 Operating Quality
              </div>
            </div>

            {/* 4-Metric Horizontal Bars */}
            <div className="md:col-span-8 space-y-3.5">
              {[
                { label: 'Business Viability', value: scorecard.metrics.businessViability },
                { label: 'Cash Flow Adequacy', value: scorecard.metrics.cashFlowAdequacy },
                { label: 'Document Completeness', value: scorecard.metrics.documentCompleteness },
                { label: 'Obligor Quality (CIBIL)', value: scorecard.metrics.obligorQuality },
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#F4F2EE]/70 uppercase">{m.label}</span>
                    <span className="font-bold text-[#C27D4B]">{m.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0E0F11] border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#C27D4B] transition-all duration-500 ease-out"
                      style={{ width: `${m.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approved Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#0E0F11] border border-white/[0.08] mb-8">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#F4F2EE]/50">
                Approved Monthly Outlay
              </div>
              <div className="font-mono text-lg font-bold text-[#C27D4B] mt-1">
                {scorecard.approvedMonthlyLeaseINR > 0
                  ? formatINR(scorecard.approvedMonthlyLeaseINR)
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-[#F4F2EE]/50">
                Sanctioned Tenure
              </div>
              <div className="font-mono text-sm text-[#F4F2EE] font-semibold mt-1">
                {scorecard.approvedTenureMonths > 0
                  ? `${scorecard.approvedTenureMonths} Months Operating Lease`
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-[#F4F2EE]/50">
                Security Deposit Term
              </div>
              <div className="font-mono text-xs text-[#F4F2EE] font-medium mt-1">
                {scorecard.securityDeposit}
              </div>
            </div>
          </div>

          {/* Underwriting Narrative */}
          <div className="p-5 bg-[#0E0F11] border border-[#C27D4B]/20 mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C27D4B] block mb-2">
              Credit Committee & Risk Officer Narrative:
            </span>
            <p className="text-xs sm:text-sm font-sans text-[#F4F2EE]/80 leading-relaxed">
              {scorecard.officerSummary}
            </p>
          </div>

          {/* Conditions & Red Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#0E0F11] p-5 border border-white/[0.06]">
              <span className="text-xs font-mono text-[#C27D4B] uppercase tracking-wider block mb-3">
                Sanction Conditions:
              </span>
              <ul className="space-y-2 text-xs font-sans text-[#F4F2EE]/75">
                {scorecard.conditions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#C27D4B] font-mono text-[10px]">■</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0E0F11] p-5 border border-white/[0.06]">
              <span className="text-xs font-mono text-[#C27D4B] uppercase tracking-wider block mb-3">
                Risk Findings / Red Flags:
              </span>
              <ul className="space-y-2 text-xs font-sans text-[#F4F2EE]/75">
                {scorecard.redFlags.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#C27D4B] font-mono text-[10px]">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="pt-6 border-t border-[#C27D4B]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => {
                alert(
                  `Term Sheet Summary ${docketNumber} downloaded.\nA copy has been dispatched to ${email}.`
                );
              }}
              className="w-full sm:w-auto py-3.5 px-6 font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-bold hover:bg-[#D89564] transition-colors"
            >
              Download Term Sheet Summary (PDF)
            </button>

            <button
              onClick={() => {
                setScorecard(null);
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto py-3.5 px-6 border border-white/20 text-[#F4F2EE]/80 font-mono text-xs uppercase tracking-wider hover:text-white"
            >
              Start Another Application
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 1: BUSINESS DETAILS
          ======================================================== */}
      {currentStep === 1 && !scorecard && (
        <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
          <div className="pb-6 border-b border-white/[0.08] mb-8">
            <span className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.25em]">
              Step 01 of 05 // Corporate Identity
            </span>
            <h2 className="font-sans text-2xl font-bold text-[#F4F2EE] mt-1">
              Business & Registration Details
            </h2>
            <p className="text-xs font-mono text-[#F4F2EE]/50 mt-1">
              Enter registered corporate entity parameters for automated MCA cross-referencing.
            </p>
          </div>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                Company / Business Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Adani Enterprise Logistics Limited"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B] transition-colors"
              />
            </div>

            {/* GSTIN & PAN Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80">
                    GSTIN (15 Characters) *
                  </label>
                  {gstin && (
                    <span
                      className={`text-[10px] font-mono ${
                        gstinRegex.test(gstin.trim().toUpperCase())
                          ? 'text-emerald-400'
                          : 'text-[#C27D4B]'
                      }`}
                    >
                      {gstinRegex.test(gstin.trim().toUpperCase()) ? '✓ Valid Format' : 'Invalid GSTIN Format'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 24AAACF1234A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className={`w-full bg-[#0E0F11] border px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none transition-colors ${
                    gstin && !gstinRegex.test(gstin.trim().toUpperCase())
                      ? 'border-[#C27D4B]'
                      : 'border-white/15 focus:border-[#C27D4B]'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80">
                    Company PAN (10 Characters) *
                  </label>
                  {companyPan && (
                    <span
                      className={`text-[10px] font-mono ${
                        panRegex.test(companyPan.trim().toUpperCase())
                          ? 'text-emerald-400'
                          : 'text-[#C27D4B]'
                      }`}
                    >
                      {panRegex.test(companyPan.trim().toUpperCase()) ? '✓ Valid Format' : 'Invalid PAN Format'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. AAACF1234A"
                  value={companyPan}
                  onChange={(e) => setCompanyPan(e.target.value.toUpperCase())}
                  className={`w-full bg-[#0E0F11] border px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none transition-colors ${
                    companyPan && !panRegex.test(companyPan.trim().toUpperCase())
                      ? 'border-[#C27D4B]'
                      : 'border-white/15 focus:border-[#C27D4B]'
                  }`}
                />
              </div>
            </div>

            {/* Director Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Director / Designated Partner Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh S. Patel"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Mobile Number (for eKYC OTP) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B]"
                />
              </div>
            </div>

            {/* Email & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  placeholder="treasury@corporate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Operating City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad / Surat / Vadodara / Gandhinagar"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B]"
                />
              </div>
            </div>

            {/* Constitution & Years in Business */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Constitution Type *
                </label>
                <select
                  value={constitution}
                  onChange={(e) => setConstitution(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-3 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                >
                  <option value="Private Limited">Private Limited</option>
                  <option value="LLP">LLP</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Public Limited">Public Limited</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Years in Business *
                </label>
                <select
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-3 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                >
                  <option value="<1">&lt; 1 Year</option>
                  <option value="1–2">1–2 Years</option>
                  <option value="2–5">2–5 Years</option>
                  <option value="5–10">5–10 Years</option>
                  <option value="10+">10+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Industry / Sector *
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-3 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                >
                  <option value="EPC & Infrastructure">EPC & Infrastructure</option>
                  <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                  <option value="IT & Enterprise Tech">IT & Enterprise Tech</option>
                  <option value="Manufacturing & Ports">Manufacturing & Ports</option>
                  <option value="Hospitality & Healthcare">Hospitality & Healthcare</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            {/* Registered Address */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                Registered Business Address *
              </label>
              <textarea
                rows={2}
                placeholder="Full address matching GST registration certificate..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B]"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex justify-end">
            <button
              onClick={() => {
                if (!isStep1Valid) {
                  alert('Please enter valid required business details (including matching GSTIN & PAN format).');
                  return;
                }
                setCurrentStep(2);
              }}
              className="py-3.5 px-8 font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-bold hover:bg-[#D89564] transition-colors"
            >
              Continue to Step 02: Asset Selection →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: ASSET SELECTION
          ======================================================== */}
      {currentStep === 2 && !scorecard && (
        <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
          <div className="pb-6 border-b border-white/[0.08] mb-8">
            <span className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.25em]">
              Step 02 of 05 // Asset Specifications
            </span>
            <h2 className="font-sans text-2xl font-bold text-[#F4F2EE] mt-1">
              Select Fleet or Machinery Package
            </h2>
            <p className="text-xs font-mono text-[#F4F2EE]/50 mt-1">
              Pre-populated from In-Scroll Configurator or choose from all 24 catalogue units.
            </p>
          </div>

          <div className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                Asset Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['luxury-fleet', 'construction-warehouse', 'it-hardware'] as CategorySlug[]).map(
                  (slug) => {
                    const isSel = category === slug;
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => {
                          setCategory(slug);
                          const matching = ASSET_CATALOGUE.filter((a) => a.category === slug);
                          if (matching.length > 0) {
                            setAssetSlug(matching[0].slug);
                            setTenure(matching[0].minTenureMonths);
                          }
                        }}
                        className={`py-3 px-4 text-xs font-mono uppercase tracking-wider text-left border transition-all ${
                          isSel
                            ? 'bg-[#C27D4B] text-[#0E0F11] font-bold border-[#C27D4B]'
                            : 'bg-[#0E0F11] text-white/60 border-white/10 hover:border-[#C27D4B]/40 hover:text-white'
                        }`}
                      >
                        {CATEGORIES[slug].name}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Asset Dropdown */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                Specific Asset Model *
              </label>
              <select
                value={assetSlug}
                onChange={(e) => {
                  setAssetSlug(e.target.value);
                  const found = ASSET_CATALOGUE.find((a) => a.slug === e.target.value);
                  if (found) setTenure(found.minTenureMonths);
                }}
                className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
              >
                {categoryAssets.map((asset) => (
                  <option key={asset.slug} value={asset.slug} className="bg-[#0E0F11]">
                    {asset.title} — {asset.monthlyRentFormatted} / mo ({asset.tenureRange})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Preferred Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Quantity Required (Units) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Preferred Tenure (Months) *
                </label>
                <select
                  value={tenure}
                  onChange={(e) => setTenure(parseInt(e.target.value, 10))}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                >
                  {[12, 18, 24, 36, 48, 60].map((m) => (
                    <option key={m} value={m} className="bg-[#0E0F11]">
                      {m} Months ({Math.round(m / 12)} Year{m >= 24 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Purpose of Lease */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                Operational Purpose / Deployment Site *
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Executive Corporate Fleet for Leadership / High-rise EPC construction in GIFT City..."
                value={purposeOfLease}
                onChange={(e) => setPurposeOfLease(e.target.value)}
                className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] placeholder-white/30 focus:outline-none focus:border-[#C27D4B]"
              />
            </div>

            {/* Live Financial Preview Card */}
            <div className="p-5 bg-[#0E0F11] border border-[#C27D4B]/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#F4F2EE]/50">
                  Estimated Monthly Outlay
                </div>
                <div className="font-mono text-2xl font-bold text-[#C27D4B] mt-1">
                  {formatINR(estimatedMonthlyLease)}
                  <span className="text-xs font-normal text-[#F4F2EE]/50 ml-2">/ mo + GST</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-[#F4F2EE]/50">
                  Upfront Capex Preserved
                </div>
                <div className="font-mono text-xl font-bold text-white mt-1">
                  {formatINR(upfrontCapitalPreserved)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="py-3 px-6 font-mono text-xs uppercase tracking-wider border border-white/20 text-[#F4F2EE]/70 hover:text-white"
            >
              ← Back to Step 01
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="py-3.5 px-8 font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-bold hover:bg-[#D89564] transition-colors"
            >
              Continue to Step 03: Financial Info →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: FINANCIAL INFO
          ======================================================== */}
      {currentStep === 3 && !scorecard && (
        <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
          <div className="pb-6 border-b border-white/[0.08] mb-8">
            <span className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.25em]">
              Step 03 of 05 // Financial & Credit Profile
            </span>
            <h2 className="font-sans text-2xl font-bold text-[#F4F2EE] mt-1">
              Financial & Banking Profile
            </h2>
            <div className="mt-2 p-3 bg-[#0E0F11] border border-[#C27D4B]/20 text-[11px] font-mono text-[#C27D4B]">
              Confidentiality Note: All financial information is held under strict confidentiality and used only for credit assessment purposes.
            </div>
          </div>

          <div className="space-y-6">
            {/* Turnover & Net Profit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Annual Turnover Last FY (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000000"
                  value={annualTurnover}
                  onChange={(e) => setAnnualTurnover(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                />
                <div className="text-[10px] font-mono text-[#F4F2EE]/40 mt-1">
                  Preview: {formatINR(parseFloat(annualTurnover || '0'))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Net Profit Last FY (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 18000000"
                  value={netProfit}
                  onChange={(e) => setNetProfit(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                />
                <div className="text-[10px] font-mono text-[#F4F2EE]/40 mt-1">
                  Preview: {formatINR(parseFloat(netProfit || '0'))}
                </div>
              </div>
            </div>

            {/* Bank Name & Years with Bank */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Primary Clearing Bank *
                </label>
                <select
                  value={primaryBank}
                  onChange={(e) => setPrimaryBank(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Other Commercial Bank">Other Commercial Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Relationship Vintage with Bank *
                </label>
                <select
                  value={yearsWithBank}
                  onChange={(e) => setYearsWithBank(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                >
                  <option value="<1">&lt; 1 Year</option>
                  <option value="1–2">1–2 Years</option>
                  <option value="3–5">3–5 Years</option>
                  <option value="5+">5+ Years</option>
                </select>
              </div>
            </div>

            {/* CIBIL Score & Existing Obligations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80">
                    CIBIL / Commercial Credit Score *
                  </label>
                  <span className="font-mono font-bold text-xs text-[#C27D4B]">
                    {cibilScore} ({cibilScore >= 750 ? 'Strong' : cibilScore >= 680 ? 'Moderate' : 'Watch'})
                  </span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="900"
                  value={cibilScore}
                  onChange={(e) => setCibilScore(parseInt(e.target.value, 10))}
                  className="w-full accent-[#C27D4B] bg-[#0E0F11] h-1.5 cursor-pointer appearance-none border border-white/10"
                />
                <div className="flex justify-between text-[9px] font-mono text-[#F4F2EE]/40 mt-1">
                  <span>600 (MIN)</span>
                  <span>750 (PRIME)</span>
                  <span>900 (MAX)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/80 mb-2">
                  Existing Monthly Debt/EMI Obligations (₹/mo) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 250000"
                  value={existingObligations}
                  onChange={(e) => setExistingObligations(e.target.value)}
                  className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                />
                <div className="text-[10px] font-mono text-[#F4F2EE]/40 mt-1">
                  Preview: {formatINR(parseFloat(existingObligations || '0'))} / month
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="py-3 px-6 font-mono text-xs uppercase tracking-wider border border-white/20 text-[#F4F2EE]/70 hover:text-white"
            >
              ← Back to Step 02
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="py-3.5 px-8 font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-bold hover:bg-[#D89564] transition-colors"
            >
              Continue to Step 04: Document Checklist →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 4: DOCUMENT CHECKLIST
          ======================================================== */}
      {currentStep === 4 && !scorecard && (
        <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
          <div className="pb-6 border-b border-white/[0.08] mb-8">
            <span className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.25em]">
              Step 04 of 05 // Verification Preparedness
            </span>
            <h2 className="font-sans text-2xl font-bold text-[#F4F2EE] mt-1">
              Statutory Document Readiness
            </h2>
            <p className="text-xs font-mono text-[#F4F2EE]/50 mt-1">
              Confirm possession of standard documentation. Verified digital upload is finalized with your dedicated relationship manager.
            </p>
          </div>

          <div className="space-y-4">
            {/* High Priority Items */}
            <div className="text-xs font-mono uppercase tracking-widest text-[#C27D4B] pt-2">
              HIGH — Mandatory for Immediate Sanction:
            </div>

            {[
              { id: 'gstCert', label: 'GST Registration Certificate (Form REG-06)' },
              { id: 'companyPanDoc', label: 'Company / Firm PAN Card Copy' },
              { id: 'itr2Years', label: 'Income Tax Returns (ITR-5/6) with CA Computation for Last 2 Financial Years' },
              { id: 'bankStatements12m', label: 'Audited Primary Bank Statements for Last 12 Consecutive Months' },
              { id: 'moaAoaDeed', label: 'MOA & AOA / Partnership Deed / Certificate of Incorporation' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3.5 bg-[#0E0F11] border border-white/[0.06] hover:border-[#C27D4B]/40 transition-colors cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={!!checklist[item.id]}
                  onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                  className="mt-1 accent-[#C27D4B] w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-xs font-mono text-[#F4F2EE] font-medium">{item.label}</div>
                  <span className="inline-block mt-0.5 text-[9px] font-mono uppercase text-[#C27D4B] tracking-wider">
                    High Priority
                  </span>
                </div>
              </label>
            ))}

            {/* Medium Priority Items */}
            <div className="text-xs font-mono uppercase tracking-widest text-[#F4F2EE]/60 pt-4">
              MEDIUM — Post-Sanction Closing Documents:
            </div>

            {[
              { id: 'directorAadhaar', label: 'Director / Designated Partner Aadhaar Card for eKYC & eSign' },
              { id: 'officeRentUtility', label: 'Registered Office Lease Agreement or Recent Electricity Bill' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3.5 bg-[#0E0F11] border border-white/[0.06] hover:border-[#C27D4B]/40 transition-colors cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={!!checklist[item.id]}
                  onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                  className="mt-1 accent-[#C27D4B] w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-xs font-mono text-[#F4F2EE] font-medium">{item.label}</div>
                  <span className="inline-block mt-0.5 text-[9px] font-mono uppercase text-white/40 tracking-wider">
                    Medium Priority
                  </span>
                </div>
              </label>
            ))}

            {/* Low Priority Items */}
            <div className="text-xs font-mono uppercase tracking-widest text-[#F4F2EE]/40 pt-4">
              LOW — Supplementary Asset Telemetry:
            </div>

            {[
              { id: 'premisesPhotos', label: 'Photographs of Business Premises, Fleet Parking & Staging Yards' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3.5 bg-[#0E0F11] border border-white/[0.06] hover:border-[#C27D4B]/40 transition-colors cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={!!checklist[item.id]}
                  onChange={(e) => setChecklist({ ...checklist, [item.id]: e.target.checked })}
                  className="mt-1 accent-[#C27D4B] w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-xs font-mono text-[#F4F2EE] font-medium">{item.label}</div>
                  <span className="inline-block mt-0.5 text-[9px] font-mono uppercase text-white/30 tracking-wider">
                    Optional / Secondary
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="py-3 px-6 font-mono text-xs uppercase tracking-wider border border-white/20 text-[#F4F2EE]/70 hover:text-white"
            >
              ← Back to Step 03
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="py-3.5 px-8 font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-bold hover:bg-[#D89564] transition-colors"
            >
              Continue to Step 05: Review & Submit →
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 5: REVIEW & SUBMIT
          ======================================================== */}
      {currentStep === 5 && !scorecard && (
        <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
          <div className="pb-6 border-b border-white/[0.08] mb-8">
            <span className="text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.25em]">
              Step 05 of 05 // Final Affirmation
            </span>
            <h2 className="font-sans text-2xl font-bold text-[#F4F2EE] mt-1">
              Review Application Summary
            </h2>
            <p className="text-xs font-mono text-[#F4F2EE]/50 mt-1">
              Verify submitted parameters before launching real-time AI credit assessment.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 Summary */}
            <div className="p-5 bg-[#0E0F11] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-mono text-[#C27D4B] uppercase tracking-wider">
                  01 / Business Entity
                </span>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-[11px] font-mono text-[#C27D4B] underline"
                >
                  Edit Step 1
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-white/40 block text-[10px]">Entity Name</span>
                  <span className="font-semibold text-white">{companyName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">GSTIN</span>
                  <span className="text-[#C27D4B]">{gstin.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">PAN</span>
                  <span className="text-white">{companyPan.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Constitution</span>
                  <span className="text-white">{constitution}</span>
                </div>
              </div>
            </div>

            {/* Step 2 Summary */}
            <div className="p-5 bg-[#0E0F11] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-mono text-[#C27D4B] uppercase tracking-wider">
                  02 / Target Asset Package
                </span>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-[11px] font-mono text-[#C27D4B] underline"
                >
                  Edit Step 2
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-white/40 block text-[10px]">Asset Model</span>
                  <span className="font-semibold text-white">{currentAsset.title}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Quantity</span>
                  <span className="text-white">{quantity} Unit(s)</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Tenure</span>
                  <span className="text-white">{tenure} Months</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Est. Monthly Outlay</span>
                  <span className="text-[#C27D4B] font-bold">{formatINR(estimatedMonthlyLease)}</span>
                </div>
              </div>
            </div>

            {/* Step 3 Summary */}
            <div className="p-5 bg-[#0E0F11] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-mono text-[#C27D4B] uppercase tracking-wider">
                  03 / Financial Metrics
                </span>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-[11px] font-mono text-[#C27D4B] underline"
                >
                  Edit Step 3
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div>
                  <span className="text-white/40 block text-[10px]">Annual Turnover</span>
                  <span className="text-white">{formatINR(parseFloat(annualTurnover || '0'))}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Net Profit</span>
                  <span className="text-white">{formatINR(parseFloat(netProfit || '0'))}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Primary Bank</span>
                  <span className="text-white">{primaryBank}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">CIBIL Score</span>
                  <span className="text-[#C27D4B] font-bold">{cibilScore}</span>
                </div>
              </div>
            </div>

            {/* Mandatory Statutory Consent Checkbox */}
            <div className="p-5 bg-[#0E0F11] border border-[#C27D4B]/40">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 accent-[#C27D4B] w-4 h-4 cursor-pointer"
                />
                <div className="text-xs font-mono text-[#F4F2EE]/85 leading-relaxed">
                  By submitting this application, you confirm that all information provided is accurate
                  and consent to Firstgen Assets Private Limited conducting a credit check (CIBIL/Experian)
                  and KYC verification using Aadhaar and PAN. This is not a binding lease commitment.
                </div>
              </label>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex justify-between">
            <button
              onClick={() => setCurrentStep(4)}
              className="py-3 px-6 font-mono text-xs uppercase tracking-wider border border-white/20 text-[#F4F2EE]/70 hover:text-white"
            >
              ← Back to Step 04
            </button>
            <button
              onClick={handleRunAssessment}
              disabled={!consentChecked || isLoading}
              className={`py-4 px-10 font-mono text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-xl ${
                consentChecked
                  ? 'bg-[#C27D4B] text-[#0E0F11] hover:bg-[#D89564] cursor-pointer'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Submit & Run AI Assessment →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <main data-nav-theme="dark" className="relative min-h-screen bg-[#0E0F11] text-[#F4F2EE] selection:bg-[#C27D4B] selection:text-[#0E0F11]">
      <Navbar />

      <section data-nav-theme="dark" className="pt-36 pb-24 md:pt-44 md:pb-32 border-b border-[#C27D4B]/20">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C27D4B]" />
              <span>Online Lease Application</span>
            </div>

            <h1 className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl tracking-tighter text-[#F4F2EE] leading-[0.98]">
              Apply for a Lease.
              <br />
              <span className="text-[#C27D4B] font-light">Instant Credit Evaluation.</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm font-mono text-[#F4F2EE]/60 max-w-2xl leading-relaxed">
              True off-balance sheet operating leases for Luxury Corporate Fleets, Heavy Equipment, and
              Enterprise IT Arrays. Section 37(1) tax deductible, zero capital debt covenants.
            </p>
          </div>

          <Suspense fallback={<div className="font-mono text-xs text-[#C27D4B]">Loading application...</div>}>
            <FiveStepApplicationInner />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
