import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  DocumentVerifyOutput,
  computeFallbackVerification,
  runDocumentVerification,
} from '@/lib/documentVerifyEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    let output: DocumentVerifyOutput;
    let mode: 'live-gemini' | 'fallback' = 'fallback';

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const systemPrompt = `You are the Head of Document Due Diligence at Firstgen Assets Private Limited, Ahmedabad. A lease applicant has provided document details for verification. Analyze the document information and return ONLY a raw JSON object (no markdown, no preamble) with keys: documentChecks (array of { docName, status: 'VERIFIED'|'FLAGGED'|'INCOMPLETE'|'MISSING', confidence: number, finding: string, action: string }), overallKYCStatus ('COMPLETE'|'PARTIAL'|'INCOMPLETE'), amlClearance ('CLEAR'|'REVIEW'|'HOLD'), identityVerified (boolean), businessVerified (boolean), financialDocScore (0-100), complianceFlags (string[]), ddSummary (2-3 sentences), recommendedAction ('PROCEED'|'ADDITIONAL DOCS REQUIRED'|'HOLD FOR REVIEW'|'ESCALATE').
Guidelines: GSTIN must be 15 chars (2-digit state code + 10-char PAN + 1 digit + Z + check digit); PAN must be 5 uppercase letters + 4 digits + 1 uppercase letter; Bank statements require minimum 12 months (6 months = INCOMPLETE); ITR requires 2 years minimum (1 year = INCOMPLETE, none = FLAGGED); Irregular GST returns = AML REVIEW flag; Director PAN and Entity PAN must be different (same PAN = FLAGGED immediately); Average monthly balance below 3x typical monthly lease value = INCOMPLETE financial adequacy; No documents provided = MISSING/REJECT across checks.`;

        const ai = new GoogleGenAI({ apiKey });

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Perform compliance & forensic due diligence on this applicant profile:\n${JSON.stringify(body)}`,
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
          output = JSON.parse(cleanedText);
          mode = 'live-gemini';
        } else {
          output = computeFallbackVerification(body);
          mode = 'fallback';
        }
      } catch {
        output = computeFallbackVerification(body);
        mode = 'fallback';
      }
    } else {
      output = computeFallbackVerification(body);
      mode = 'fallback';
    }

    const responsePayload = runDocumentVerification(body, output, mode);

    return new NextResponse(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Verification-Mode': mode,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Document Due Diligence Engine Error', details: String(error) },
      { status: 500 }
    );
  }
}
