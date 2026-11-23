import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  CreditAssessmentOutput,
  computeFallbackAssessment,
  runCreditAssessment,
} from '@/lib/creditAssessmentEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    let assessment: CreditAssessmentOutput;
    let mode: 'live-gemini' | 'fallback' = 'fallback';

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const systemPrompt = `You are the Senior Credit & Compliance Officer at Firstgen Assets Private Limited, a premium asset leasing company in Ahmedabad, India. Your role is to conduct real-time due diligence on lease applications. Analyze the provided application data and return a STRICT JSON object (raw JSON only, no markdown, no preamble) with keys: overallScore (0-100), riskGrade (AAA/AA/A/BBB/BB/B/CCC/REJECT), recommendation (APPROVE/CONDITIONAL/REJECT), approvedMonthly (string formatted in INR), approvedTenure (string), securityDeposit (string), conditions (string[]), redFlags (string[]), creditAssessment ({ businessViability: number, cashFlowAdequacy: number, documentCompleteness: number, obligorQuality: number }), summary (2-3 sentences), nextSteps (string[]).
Guidelines: Score generously for established businesses, GST-registered entities, strong turnover; flag missing mandatory documents (GST, PAN, ITR, Bank Statements) in redFlags; low turnover relative to lease value = lower score & higher conditions; construction companies applying for construction equipment = positive obligor match; luxury fleet for IT/pharma/professional services = strong approval profile; IT hardware for startups/early-stage SMEs = moderate risk, recommend guarantor; CIBIL below 650 = CONDITIONAL minimum, below 550 = REJECT trigger; business vintage under 2 years = additional security deposit condition; missing all 4 mandatory documents = REJECT regardless of other factors; be commercially sensible for Indian market conditions.`;

        const payloadData = {
          businessDetails: {
            companyName: body.businessDetails?.companyName,
            constitution: body.businessDetails?.constitution,
            yearsInBusiness: body.businessDetails?.yearsInBusiness,
            industry: body.businessDetails?.industry,
            city: body.businessDetails?.city,
            hasGstin: Boolean(body.businessDetails?.gstin),
            hasPan: Boolean(body.businessDetails?.companyPan),
          },
          assetSelection: body.assetSelection,
          financialInfo: body.financialInfo,
          documentChecklist: body.documentChecklist,
        };

        const ai = new GoogleGenAI({ apiKey });

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Conduct underwriting evaluation on this lease application:\n${JSON.stringify(payloadData)}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            abortSignal: controller.signal,
          },
        });

        clearTimeout(timeoutId);

        const rawText = geminiResponse.text || '';
        const cleanedText = rawText
          .replace(/```(?:json)?/gi, '')
          .replace(/```/g, '')
          .trim();

        if (cleanedText) {
          assessment = JSON.parse(cleanedText);
          mode = 'live-gemini';
        } else {
          assessment = computeFallbackAssessment(body);
          mode = 'fallback';
        }
      } catch {
        assessment = computeFallbackAssessment(body);
        mode = 'fallback';
      }
    } else {
      assessment = computeFallbackAssessment(body);
      mode = 'fallback';
    }

    const responsePayload = runCreditAssessment(body, assessment, mode);

    return new NextResponse(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Assessment-Mode': mode,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal Credit Underwriting Engine Error', details: String(error) },
      { status: 500 }
    );
  }
}
