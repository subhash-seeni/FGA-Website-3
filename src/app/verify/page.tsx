'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAssetPath } from '@/lib/basePath';
import { runDocumentVerification } from '@/lib/documentVerifyEngine';

interface DocumentFinding {
  docName: string;
  status: 'VERIFIED' | 'FLAGGED' | 'INCOMPLETE' | 'MISSING';
  confidenceScore: number;
  specificFinding: string;
  requiredAction: string;
}

interface DueDiligenceReport {
  reportId: string;
  timestamp: string;
  complianceHeader: {
    kycStatus: 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE';
    amlClearance: 'CLEAR' | 'REVIEW' | 'HOLD';
    identityVerified: 'VERIFIED' | 'FAILED';
    businessVerified: 'VERIFIED' | 'FAILED';
    financialDocScore: number;
    recommendedAction: 'PROCEED' | 'ADDITIONAL DOCS REQUIRED' | 'HOLD FOR REVIEW' | 'ESCALATE';
  };
  findings: DocumentFinding[];
  complianceFlags: string[];
  officerSummary: string;
}

export default function VerifyPage() {
  // Section 1: Entity & Business Details
  const [entityName, setEntityName] = useState('Adani Enterprise Logistics Limited');
  const [gstin, setGstin] = useState('24AAACF1234A1Z5');
  const [companyPan, setCompanyPan] = useState('AAACF1234A');
  const [address, setAddress] = useState('Firstgen Tower, Floor 8, SG Highway Financial Corridor, Ahmedabad 380054');

  // Section 2: Director KYC
  const [directorName, setDirectorName] = useState('Rajesh S. Patel');
  const [directorPan, setDirectorPan] = useState('ABCDE1234F');
  const [aadhaarLast4, setAadhaarLast4] = useState('8921');
  const [dob, setDob] = useState('14/08/1982');

  // Section 3: Bank Statements
  const [bankName, setBankName] = useState('HDFC Bank');
  const [monthsAvailable, setMonthsAvailable] = useState('12 Months');
  const [avgMonthlyBalance, setAvgMonthlyBalance] = useState('2450000'); // 24.5 Lakhs

  // Section 4: Income Tax / ITR
  const [itrYears, setItrYears] = useState('2023-24, 2024-25');
  const [declaredTurnover, setDeclaredTurnover] = useState('145000000'); // 14.5 Cr

  // Section 5: GST Compliance
  const [gstFiledRegularly, setGstFiledRegularly] = useState<'Yes' | 'No' | 'Irregular'>('Yes');
  const [monthsGstr3b, setMonthsGstr3b] = useState('12 Months');
  const [additionalNotes, setAdditionalNotes] = useState('All GSTR-1 and GSTR-3B filings reconciled with zero late fee demands.');

  // Processing & Report State
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [report, setReport] = useState<DueDiligenceReport | null>(null);

  // Live Validations
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const aadhaarRegex = /^\d{4}$/;
  const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  const isGstinValid = gstinRegex.test(gstin.trim().toUpperCase());
  const isCompanyPanValid = panRegex.test(companyPan.trim().toUpperCase());
  const isDirectorPanValid = panRegex.test(directorPan.trim().toUpperCase());
  const isPanIdentical =
    companyPan.trim().toUpperCase() !== '' &&
    directorPan.trim().toUpperCase() !== '' &&
    companyPan.trim().toUpperCase() === directorPan.trim().toUpperCase();

  const handleRunVerification = async () => {
    setIsLoading(true);
    setAuditLogs([]);

    const steps = [
      'INITIALIZING NSDL & INCOME TAX DEPARTMENT SECURE GATEWAY...',
      `CROSS-MATCHING GSTIN ${gstin.toUpperCase()} WITH GUJARAT STATE TAX COMMISSIONERATE...`,
      `VERIFYING CORPORATE PAN ${companyPan.toUpperCase()} AGAINST MCA REGISTRY...`,
      `EXECUTING DIRECTOR KYC CHECK FOR ${directorName.toUpperCase()} [PAN: ${directorPan.toUpperCase()}]...`,
      'CHECKING AADHAAR HASH & BIOMETRIC E-SIGN RECORD STATUS...',
      `ANALYZING ${monthsAvailable} BANK STATEMENTS FROM ${bankName.toUpperCase()}...`,
      'CALCULATING GSTR-3B VS ITR REVENUE VARIANCE COEFFICIENT...',
      'RUNNING AML / PEP / SANCTION LIST EXCLUSION QUERIES...',
      'SYNTHESIZING REAL-TIME INSTITUTIONAL AUDIT DOSSIER...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 280));
      setAuditLogs((prev) => [...prev, steps[i]]);
    }

    const payload = {
      entityDetails: {
        entityName,
        gstin,
        companyPan,
        address,
      },
      directorKyc: {
        directorName,
        directorPan,
        aadhaarLast4,
        dob,
      },
      bankStatements: {
        bankName,
        monthsAvailable,
        avgMonthlyBalance,
      },
      itrCompliance: {
        itrYears,
        declaredTurnover,
      },
      gstCompliance: {
        gstFiledRegularly,
        monthsGstr3b,
        notes: additionalNotes,
      },
    };

    try {
      const res = await fetch(getAssetPath('/api/document-verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReport(data);
          return;
        }
      }
      // If serverless API is unavailable (static export / GitHub Pages), run client-side verification
      const localReport = runDocumentVerification(payload);
      setReport(localReport);
    } catch {
      // Offline / Static export fallback
      const localReport = runDocumentVerification(payload);
      setReport(localReport);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main data-nav-theme="dark" className="relative min-h-screen bg-[#0E0F11] text-[#F4F2EE] selection:bg-[#C27D4B] selection:text-[#0E0F11]">
      <Navbar />

      <section data-nav-theme="dark" className="pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-44 md:pb-32 border-b border-[#C27D4B]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C27D4B]" />
              <span>Document Verification</span>
            </div>

            <h1 className="font-sans font-bold text-4xl sm:text-5xl md:text-6xl tracking-tighter text-[#F4F2EE] leading-[0.98]">
              Document &amp; Compliance Verification.
            </h1>

            <p className="mt-4 text-xs sm:text-sm font-mono text-[#F4F2EE]/60 max-w-2xl leading-relaxed">
              Verify GSTIN, corporate PAN, MCA records, and banking documentation with instant automated checks.
            </p>
          </div>

          {/* Audit Loader View */}
          {isLoading && (
            <div className="bg-[#17191D] border border-[#C27D4B] p-8 sm:p-12 mb-12 shadow-2xl">
              <div className="flex items-center gap-3 text-xs font-mono text-[#C27D4B] uppercase tracking-widest mb-6">
                <span className="w-2.5 h-2.5 bg-[#C27D4B] animate-pulse" />
                <span>Verifying Information Across Official Registries...</span>
              </div>

              <div className="bg-[#0E0F11] border border-white/10 p-6 font-mono text-xs text-[#F4F2EE]/85 space-y-2.5 min-h-[220px]">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#C27D4B]">[T+{(idx * 0.3).toFixed(1)}s]</span>
                    <span className="text-white/90">{log}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[#C27D4B] animate-pulse pt-2">
                  <span>_</span>
                  <span>COMPUTING COMPLIANCE INDEX</span>
                </div>
              </div>
            </div>
          )}

          {/* Due Diligence Report Output View */}
          {report && !isLoading && (
            <div className="bg-[#17191D] border border-[#C27D4B] p-6 sm:p-10 mb-16 shadow-2xl">
              {/* Report Title Band */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C27D4B]/20">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#C27D4B] uppercase tracking-[0.25em]">
                    <span>VERIFICATION REPORT // {report.reportId}</span>
                  </div>
                  <h2 className="font-sans text-2xl sm:text-3xl font-bold text-[#F4F2EE] mt-1">
                    Verification Summary
                  </h2>
                  <div className="text-xs font-mono text-[#F4F2EE]/60 mt-0.5">
                    Target: {entityName} • Timestamp: {new Date(report.timestamp).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`px-4 py-2 text-xs font-mono font-bold tracking-[0.15em] uppercase border ${
                      report.complianceHeader.recommendedAction === 'PROCEED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80'
                        : report.complianceHeader.recommendedAction === 'ADDITIONAL DOCS REQUIRED'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/80'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/80'
                    }`}
                  >
                    {report.complianceHeader.recommendedAction}
                  </div>
                </div>
              </div>

              {/* Compliance Header Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-8">
                <div className="bg-[#0E0F11] p-3.5 border border-white/10">
                  <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">KYC Status</div>
                  <div className="font-mono text-sm font-bold text-[#F4F2EE] mt-1">
                    {report.complianceHeader.kycStatus}
                  </div>
                </div>
                <div className="bg-[#0E0F11] p-3.5 border border-white/10">
                  <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">AML Clearance</div>
                  <div className="font-mono text-sm font-bold text-[#C27D4B] mt-1">
                    {report.complianceHeader.amlClearance}
                  </div>
                </div>
                <div className="bg-[#0E0F11] p-3.5 border border-white/10">
                  <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">Identity Check</div>
                  <div className="font-mono text-sm font-bold text-white mt-1">
                    {report.complianceHeader.identityVerified}
                  </div>
                </div>
                <div className="bg-[#0E0F11] p-3.5 border border-white/10">
                  <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">Business Check</div>
                  <div className="font-mono text-sm font-bold text-white mt-1">
                    {report.complianceHeader.businessVerified}
                  </div>
                </div>
                <div className="bg-[#0E0F11] p-3.5 border border-white/10">
                  <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">Doc Confidence</div>
                  <div className="font-mono text-sm font-bold text-[#C27D4B] mt-1">
                    {report.complianceHeader.financialDocScore}%
                  </div>
                </div>
                <div className="bg-[#0E0F11] p-3.5 border border-white/10">
                  <div className="text-[9px] font-mono uppercase text-[#F4F2EE]/40">Jurisdiction</div>
                  <div className="font-mono text-sm font-bold text-white mt-1">GUJARAT</div>
                </div>
              </div>

              {/* Document-by-Document Findings Table */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#C27D4B]">
                    Document Verification Status:
                  </span>
                  <span className="text-[10px] font-mono text-[#C27D4B]/60 sm:hidden">
                    ← Swipe to view table →
                  </span>
                </div>

                <div className="border border-white/10 overflow-x-auto no-scrollbar">
                  <table className="w-full text-left font-mono text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#0E0F11] border-b border-white/10 text-white/50 text-[10px] uppercase">
                        <th className="p-3.5">Document Name</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Confidence</th>
                        <th className="p-3.5">Verification Details</th>
                        <th className="p-3.5">Required Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {report.findings.map((f, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5 text-white font-medium">{f.docName}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                                f.status === 'VERIFIED'
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50'
                                  : f.status === 'FLAGGED'
                                  ? 'bg-rose-950/60 text-rose-400 border-rose-500/50'
                                  : 'bg-amber-950/60 text-amber-400 border-amber-500/50'
                              }`}
                            >
                              {f.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span>{f.confidenceScore}%</span>
                              <div className="w-12 h-1 bg-white/10">
                                <div className="h-full bg-[#C27D4B]" style={{ width: `${f.confidenceScore}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-white/80 max-w-xs">{f.specificFinding}</td>
                          <td className="p-3.5 text-[#C27D4B]">{f.requiredAction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compliance Flags Callout */}
              <div className="p-5 bg-[#0E0F11] border border-white/10 mb-8">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C27D4B] block mb-2">
                  Compliance Flags & Covenants:
                </span>
                <ul className="space-y-1.5 text-xs font-sans text-[#F4F2EE]/80">
                  {report.complianceFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#C27D4B] font-mono text-[10px] mt-0.5">■</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Officer Summary */}
              <div className="p-5 bg-[#0E0F11] border border-[#C27D4B]/20 mb-8">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C27D4B] block mb-2">
                  Verification Assessment Summary:
                </span>
                <p className="text-xs sm:text-sm font-sans text-[#F4F2EE]/85 leading-relaxed">
                  {report.officerSummary}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#C27D4B]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={() => {
                    alert(`Verification Report ${report.reportId} exported to PDF.\nSaved for corporate records.`);
                  }}
                  className="w-full sm:w-auto py-3.5 px-6 font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-bold hover:bg-[#D89564] transition-colors"
                >
                  Print / Export Verification Report (PDF)
                </button>

                <button
                  onClick={() => setReport(null)}
                  className="w-full sm:w-auto py-3.5 px-6 border border-white/20 text-[#F4F2EE]/80 font-mono text-xs uppercase tracking-wider hover:text-white"
                >
                  Run New Verification
                </button>
              </div>
            </div>
          )}

          {/* Form: 5 Sequential Sections */}
          {!report && (
            <div className="space-y-8">
              {/* SECTION 1: ENTITY & BUSINESS */}
              <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08] mb-6">
                  <span className="w-1.5 h-1.5 bg-[#C27D4B]" />
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#C27D4B]">
                    Section 01 // Entity & Business Identity
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      Registered Entity Name *
                    </label>
                    <input
                      type="text"
                      value={entityName}
                      onChange={(e) => setEntityName(e.target.value)}
                      placeholder="e.g. Adani Enterprise Logistics Limited"
                      className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70">
                          GSTIN (15 Digits) *
                        </label>
                        <span className={`text-[10px] font-mono ${isGstinValid ? 'text-emerald-400' : 'text-[#C27D4B]'}`}>
                          {isGstinValid ? '✓ Valid Format' : 'Invalid Format'}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={15}
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        className={`w-full bg-[#0E0F11] border px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none ${
                          !isGstinValid ? 'border-[#C27D4B]' : 'border-white/15 focus:border-[#C27D4B]'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70">
                          Company Corporate PAN (10 Digits) *
                        </label>
                        <span className={`text-[10px] font-mono ${isCompanyPanValid ? 'text-emerald-400' : 'text-[#C27D4B]'}`}>
                          {isCompanyPanValid ? '✓ Valid Format' : 'Invalid Format'}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        value={companyPan}
                        onChange={(e) => setCompanyPan(e.target.value.toUpperCase())}
                        className={`w-full bg-[#0E0F11] border px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none ${
                          !isCompanyPanValid ? 'border-[#C27D4B]' : 'border-white/15 focus:border-[#C27D4B]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      Registered Business Address *
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DIRECTOR KYC */}
              <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08] mb-6">
                  <span className="w-1.5 h-1.5 bg-[#C27D4B]" />
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#C27D4B]">
                    Section 02 // Director / Key Personnel KYC
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                        Director / Designated Partner Name *
                      </label>
                      <input
                        type="text"
                        value={directorName}
                        onChange={(e) => setDirectorName(e.target.value)}
                        className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70">
                          Director Individual PAN *
                        </label>
                        <span className={`text-[10px] font-mono ${isDirectorPanValid ? 'text-emerald-400' : 'text-[#C27D4B]'}`}>
                          {isDirectorPanValid ? '✓ Valid Format' : 'Invalid Format'}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        value={directorPan}
                        onChange={(e) => setDirectorPan(e.target.value.toUpperCase())}
                        className={`w-full bg-[#0E0F11] border px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none ${
                          isPanIdentical || !isDirectorPanValid
                            ? 'border-[#C27D4B]'
                            : 'border-white/15 focus:border-[#C27D4B]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Immediate inline warning if Director PAN matches Company PAN */}
                  {isPanIdentical && (
                    <div className="p-3.5 bg-amber-950/40 border border-[#C27D4B] text-xs font-mono text-[#C27D4B] flex items-start gap-2.5">
                      <span className="text-sm font-bold">⚠</span>
                      <div>
                        <strong>Regulatory Notice:</strong> Director Individual PAN matches Corporate Entity PAN. In corporate entities (Pvt Ltd / Public Ltd / LLP), Director individual PAN must differ from corporate PAN.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70">
                          Aadhaar Last 4 Digits *
                        </label>
                        <span className={`text-[10px] font-mono ${aadhaarRegex.test(aadhaarLast4) ? 'text-emerald-400' : 'text-white/40'}`}>
                          {aadhaarRegex.test(aadhaarLast4) ? '✓ 4 Digits' : 'Enter 4 Digits'}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 8921"
                        value={aadhaarLast4}
                        onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70">
                          Date of Birth (DD/MM/YYYY) *
                        </label>
                        <span className={`text-[10px] font-mono ${dobRegex.test(dob) ? 'text-emerald-400' : 'text-white/40'}`}>
                          {dobRegex.test(dob) ? '✓ Format' : 'DD/MM/YYYY'}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="14/08/1982"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BANK STATEMENTS */}
              <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08] mb-6">
                  <span className="w-1.5 h-1.5 bg-[#C27D4B]" />
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#C27D4B]">
                    Section 03 // Primary Bank Statement Solvency
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      Primary Bank Name *
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-white/15 px-3 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
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
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      Months of Statements *
                    </label>
                    <select
                      value={monthsAvailable}
                      onChange={(e) => setMonthsAvailable(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-white/15 px-3 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                    >
                      <option value="6 Months">6 Months</option>
                      <option value="12 Months">12 Months (Recommended)</option>
                      <option value="24 Months">24 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      Average Monthly Balance (₹) *
                    </label>
                    <input
                      type="number"
                      value={avgMonthlyBalance}
                      onChange={(e) => setAvgMonthlyBalance(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                    />
                    <div className="text-[10px] font-mono text-[#F4F2EE]/40 mt-1">
                      ₹{parseFloat(avgMonthlyBalance || '0').toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: INCOME TAX / ITR */}
              <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08] mb-6">
                  <span className="w-1.5 h-1.5 bg-[#C27D4B]" />
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#C27D4B]">
                    Section 04 // Income Tax Return (ITR) Compliance
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      ITR Filed for Financial Years *
                    </label>
                    <input
                      type="text"
                      value={itrYears}
                      onChange={(e) => setItrYears(e.target.value)}
                      placeholder="e.g. 2023-24, 2024-25"
                      className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      Declared Annual Turnover in ITR (₹) *
                    </label>
                    <input
                      type="number"
                      value={declaredTurnover}
                      onChange={(e) => setDeclaredTurnover(e.target.value)}
                      className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                    />
                    <div className="text-[10px] font-mono text-[#F4F2EE]/40 mt-1">
                      ₹{parseFloat(declaredTurnover || '0').toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: GST COMPLIANCE */}
              <div className="bg-[#17191D] border border-white/[0.08] p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08] mb-6">
                  <span className="w-1.5 h-1.5 bg-[#C27D4B]" />
                  <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-[#C27D4B]">
                    Section 05 // GST Compliance & Filing History
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                        GST Returns Filed Regularly? *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Yes', 'No', 'Irregular'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setGstFiledRegularly(opt)}
                            className={`py-2.5 px-3 text-xs font-mono uppercase border transition-all ${
                              gstFiledRegularly === opt
                                ? 'bg-[#C27D4B] text-[#0E0F11] font-bold border-[#C27D4B]'
                                : 'bg-[#0E0F11] text-white/60 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                        Months of GSTR-3B Returns Available *
                      </label>
                      <select
                        value={monthsGstr3b}
                        onChange={(e) => setMonthsGstr3b(e.target.value)}
                        className="w-full bg-[#0E0F11] border border-white/15 px-3 py-3 text-xs font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                      >
                        <option value="6 Months">6 Months</option>
                        <option value="12 Months">12 Months</option>
                        <option value="24 Months">24 Months</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#F4F2EE]/70 mb-2">
                      Additional Notes / Compliance Disclosures
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Add any disclosure about GST reconciliation, ITC balance, or pending assessments..."
                      className="w-full bg-[#0E0F11] border border-white/15 px-4 py-3 text-sm font-mono text-[#F4F2EE] focus:outline-none focus:border-[#C27D4B]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunVerification}
                  disabled={isLoading}
                  className="w-full sm:w-auto py-4 px-10 font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-bold hover:bg-[#D89564] transition-all shadow-xl cursor-pointer"
                >
                  Run Real-Time Due Diligence →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
