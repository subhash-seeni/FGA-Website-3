export interface CreditAssessmentOutput {
  overallScore: number;
  riskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'REJECT';
  recommendation: 'APPROVE' | 'CONDITIONAL' | 'REJECT';
  approvedMonthly: string;
  approvedTenure: string;
  securityDeposit: string;
  conditions: string[];
  redFlags: string[];
  creditAssessment: {
    businessViability: number;
    cashFlowAdequacy: number;
    documentCompleteness: number;
    obligorQuality: number;
  };
  summary: string;
  nextSteps: string[];
}

export interface CreditScorecardPayload {
  success: boolean;
  timestamp: string;
  docketNumber: string;
  assessmentMode: 'live-gemini' | 'fallback';
  scorecard: {
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
  };
  [key: string]: unknown;
}

// Deterministic rule-based underwriting engine implementing exact risk guidelines
export function computeFallbackAssessment(body: Record<string, unknown>): CreditAssessmentOutput {
  const business = (body.businessDetails || {}) as Record<string, string>;
  const asset = (body.assetSelection || {}) as Record<string, unknown>;
  const financial = (body.financialInfo || {}) as Record<string, string>;
  const docs = (body.documentChecklist || {}) as Record<string, boolean>;

  const turnover = parseFloat(financial.annualTurnover || '0');
  const netProfit = parseFloat(financial.netProfit || '0');
  const cibil = parseInt(financial.cibilScore || '750', 10);
  const existingObligations = parseFloat(financial.existingObligations || '0');
  const estimatedMonthly = parseFloat(String(asset.estimatedMonthly || '100000'));
  const tenureMonths = parseInt(String(asset.tenureMonths || '36'), 10);
  const quantity = parseInt(String(asset.quantity || '1'), 10);
  const industry = (business.industry || '').toLowerCase();
  const assetCategory = String(asset.category || '').toLowerCase();
  const years = business.yearsInBusiness || '2–5';

  const redFlags: string[] = [];
  const conditions: string[] = [];

  // Check 4 mandatory documents (GST, PAN, ITR, Bank Statements)
  const hasGst = Boolean(docs.gstCert);
  const hasPan = Boolean(docs.companyPanDoc);
  const hasItr = Boolean(docs.itr2Years);
  const hasBankStatements = Boolean(docs.bankStatements12m);

  if (!hasGst) redFlags.push('Missing mandatory GST Registration Certificate (REG-06).');
  if (!hasPan) redFlags.push('Missing mandatory Corporate PAN card verification.');
  if (!hasItr) redFlags.push('Missing mandatory audited Income Tax Returns for preceding 2 years.');
  if (!hasBankStatements) redFlags.push('Missing mandatory 12-month primary bank statements.');

  const missingMandatoryCount = [hasGst, hasPan, hasItr, hasBankStatements].filter((v) => !v).length;
  const missingAllMandatory = missingMandatoryCount === 4;

  // 1. Business Viability (0-100)
  let businessViability = 55;
  if (years === '10+') businessViability += 35;
  else if (years === '5–10') businessViability += 25;
  else if (years === '2–5') businessViability += 15;
  else if (years === '1–2') businessViability += 5;
  else businessViability -= 15;

  if (years === '<1' || years === '1–2') {
    conditions.push('Business vintage under 2 years: minimum 3-month refundable security deposit required.');
  }

  // Industry vs Asset Obligor Match
  if (
    (industry.includes('construction') || industry.includes('epc') || industry.includes('infra')) &&
    assetCategory.includes('construction')
  ) {
    businessViability += 10; // positive obligor match
  }
  if (
    (industry.includes('it') || industry.includes('software') || industry.includes('pharma') || industry.includes('services')) &&
    assetCategory.includes('fleet')
  ) {
    businessViability += 10; // luxury fleet for corporate leadership
  }
  if (assetCategory.includes('it') && (years === '<1' || years === '1–2')) {
    conditions.push('IT hardware deployment for emerging enterprise: corporate promoter guarantee mandated.');
  }

  businessViability = Math.min(100, Math.max(10, businessViability));

  // 2. Cash Flow Adequacy (0-100)
  let cashFlowAdequacy = 60;
  const monthlyProfitEstimate = netProfit > 0 ? netProfit / 12 : (turnover * 0.06) / 12;
  const totalMonthlyCommitment = estimatedMonthly + existingObligations;
  const dscr = totalMonthlyCommitment > 0 ? monthlyProfitEstimate / totalMonthlyCommitment : 1.2;

  if (dscr >= 2.5) cashFlowAdequacy = 95;
  else if (dscr >= 1.8) cashFlowAdequacy = 85;
  else if (dscr >= 1.2) cashFlowAdequacy = 72;
  else if (dscr >= 0.8) cashFlowAdequacy = 52;
  else {
    cashFlowAdequacy = 30;
    redFlags.push('Cash flow buffer insufficient relative to requested monthly lease commitment.');
  }

  const annualLeaseValue = estimatedMonthly * 12;
  if (turnover > 0 && turnover < annualLeaseValue * 3) {
    cashFlowAdequacy -= 15;
    conditions.push('Turnover to lease exposure elevated: quarterly certified GST turnover disclosures required.');
  }

  cashFlowAdequacy = Math.min(100, Math.max(10, cashFlowAdequacy));

  // 3. Document Completeness (0-100)
  const docValues = Object.values(docs);
  const checkedDocsCount = docValues.filter(Boolean).length;
  let documentCompleteness = Math.round((checkedDocsCount / Math.max(docValues.length, 1)) * 100);
  if (missingMandatoryCount > 0) {
    documentCompleteness = Math.min(documentCompleteness, 100 - missingMandatoryCount * 20);
  }

  // 4. Obligor Quality (0-100) based on CIBIL
  let obligorQuality = 65;
  if (cibil >= 800) obligorQuality = 98;
  else if (cibil >= 750) obligorQuality = 90;
  else if (cibil >= 700) obligorQuality = 78;
  else if (cibil >= 650) obligorQuality = 62;
  else if (cibil >= 550) obligorQuality = 42;
  else obligorQuality = 20;

  // Aggregate Weighted Score
  let overallScore = Math.round(
    cashFlowAdequacy * 0.35 +
    obligorQuality * 0.30 +
    businessViability * 0.20 +
    documentCompleteness * 0.15
  );

  // Hard Triggers
  let recommendation: 'APPROVE' | 'CONDITIONAL' | 'REJECT' = 'CONDITIONAL';
  let riskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'REJECT' = 'BBB';
  let securityDeposit = '2 Months Lease Deposit (Refundable)';

  if (missingAllMandatory || cibil < 550) {
    recommendation = 'REJECT';
    riskGrade = 'REJECT';
    overallScore = Math.min(overallScore, 42);
    if (missingAllMandatory) redFlags.push('Missing all 4 mandatory regulatory documents (GST, PAN, ITR, Statements).');
    if (cibil < 550) redFlags.push('CIBIL score below 550 regulatory underwriting floor.');
  } else if (cibil < 650) {
    recommendation = 'CONDITIONAL';
    riskGrade = overallScore >= 60 ? 'BBB' : 'BB';
    conditions.push('CIBIL under 650: personal promoter guarantee and 3-month security deposit required.');
  } else if (overallScore >= 88 && missingMandatoryCount === 0) {
    recommendation = 'APPROVE';
    riskGrade = 'AAA';
    securityDeposit = '1 Month Security Deposit (Refundable)';
  } else if (overallScore >= 78 && missingMandatoryCount === 0) {
    recommendation = 'APPROVE';
    riskGrade = 'AA';
    securityDeposit = '1.5 Months Security Deposit (Refundable)';
  } else if (overallScore >= 68) {
    recommendation = 'APPROVE';
    riskGrade = 'A';
    securityDeposit = '2 Months Security Deposit (Refundable)';
  } else if (overallScore >= 55) {
    recommendation = 'CONDITIONAL';
    riskGrade = 'BBB';
    securityDeposit = '3 Months Security Deposit (Refundable)';
  } else {
    recommendation = 'REJECT';
    riskGrade = 'REJECT';
  }

  if (recommendation !== 'REJECT') {
    conditions.push('Mandatory eNACH direct debit registration on primary clearing account.');
    conditions.push('Board Resolution acknowledging operating lease commitment under Ind AS 116.');
    conditions.push('Signed zero-depreciation insurance endorsement certificate.');
  }

  const approvedMonthly =
    recommendation === 'REJECT'
      ? '₹0'
      : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(estimatedMonthly);

  const approvedTenure = recommendation === 'REJECT' ? '0 Months' : `${tenureMonths} Months Operating Lease`;

  const summary =
    recommendation === 'APPROVE'
      ? `Applicant ${business.companyName || 'Corporate Entity'} demonstrates solid commercial credentials with healthy cash flow buffers (${dscr.toFixed(1)}x DSCR) and favorable obligor standing (${cibil} CIBIL). The proposed lease for ${quantity} unit(s) across ${tenureMonths} months is recommended for immediate execution under Section 37(1).`
      : recommendation === 'CONDITIONAL'
      ? `Application is conditionally cleared subject to enhanced risk mitigation covenants. Operating debt coverage is sustainable, but secondary stipulations (eNACH mandate, promoter guarantee, and ${securityDeposit}) are required prior to asset dispatch.`
      : `Application does not satisfy institutional underwriting criteria due to severe cash flow leverage or credit risk indicators. Asset deployment cannot be sanctioned without substantial equity co-collateral.`;

  const nextSteps =
    recommendation !== 'REJECT'
      ? [
          'Firstgen Digital Term Sheet transmitted to primary email for Aadhaar eSign.',
          'Dedicated Account Director assigned at Ahmedabad corporate desk.',
          'Asset reservation hold placed at Changodar/Sanand regional staging yard.',
        ]
      : [
          'Consultation available with Firstgen Risk Desk for restructuring with co-guarantor.',
          'Re-application eligible following submission of H2 audited financials.',
        ];

  return {
    overallScore,
    riskGrade,
    recommendation,
    approvedMonthly,
    approvedTenure,
    securityDeposit,
    conditions,
    redFlags: redFlags.length > 0 ? redFlags : ['None Identified — Satisfies Firstgen Risk Matrix'],
    creditAssessment: {
      businessViability,
      cashFlowAdequacy,
      documentCompleteness,
      obligorQuality,
    },
    summary,
    nextSteps,
  };
}

export function runCreditAssessment(
  body: Record<string, unknown>,
  assessmentOverride?: CreditAssessmentOutput,
  mode: 'live-gemini' | 'fallback' = 'fallback'
): CreditScorecardPayload {
  const assessment = assessmentOverride || computeFallbackAssessment(body);
  const asset = (body.assetSelection || {}) as Record<string, unknown>;

  const numericMonthly =
    parseFloat(String(assessment.approvedMonthly || '0').replace(/[^0-9.]/g, '')) ||
    (assessment.recommendation === 'REJECT' ? 0 : parseFloat(String(asset.estimatedMonthly || '0')));

  const tenureVal =
    parseInt(String(assessment.approvedTenure || '0').replace(/[^0-9]/g, ''), 10) ||
    (assessment.recommendation === 'REJECT' ? 0 : parseInt(String(asset.tenureMonths || '36'), 10));

  return {
    success: true,
    timestamp: new Date().toISOString(),
    docketNumber: `FGA-CR-${Math.floor(100000 + Math.random() * 900000)}`,
    assessmentMode: mode,
    ...assessment,
    scorecard: {
      overallScore: assessment.overallScore,
      riskGrade: assessment.riskGrade,
      recommendation: assessment.recommendation,
      approvedMonthlyLeaseINR: numericMonthly,
      approvedTenureMonths: tenureVal,
      securityDeposit: assessment.securityDeposit,
      metrics: {
        businessViability: assessment.creditAssessment?.businessViability ?? 70,
        cashFlowAdequacy: assessment.creditAssessment?.cashFlowAdequacy ?? 70,
        documentCompleteness: assessment.creditAssessment?.documentCompleteness ?? 70,
        obligorQuality: assessment.creditAssessment?.obligorQuality ?? 70,
      },
      conditions: assessment.conditions,
      redFlags: assessment.redFlags,
      officerSummary: assessment.summary,
      nextSteps: assessment.nextSteps,
    },
  };
}
