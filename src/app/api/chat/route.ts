import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const FIRSTGEN_SYSTEM_PROMPT = `You are Firstgen Concierge, the executive AI leasing advisor for Firstgen Assets Private Limited, headquartered in the SG Highway Financial Corridor in Ahmedabad, Gujarat, India (CIN: U65929GJ2024PTC149821).

ABOUT FIRSTGEN ASSETS:
- We structure true off-balance-sheet operating leases for Indian enterprises, liberating corporate balance sheets from dead capital.
- Three Core Portfolios:
  1. Luxury Fleet: Rolls-Royce Ghost (₹4,20,000/mo), Mercedes-Benz S-Class (₹2,40,000/mo), BMW 7 Series (₹2,10,000/mo), Range Rover Vogue (₹2,60,000/mo), Porsche Cayenne (₹1,80,000/mo), Audi A8 L (₹1,95,000/mo), Lexus LS 500h (₹1,90,000/mo), Jaguar XJ L (₹1,65,000/mo).
  2. Construction & Heavy Machinery: 40-Tonne Industrial Tower Cranes (₹3,80,000/mo), Komatsu PC200 Excavators (₹2,10,000/mo), JCB 3CX Backhoe Loaders (₹1,10,000/mo), Toyota 5T Electric Forklifts (₹85,000/mo), Putzmeister Concrete Pumps (₹2,40,000/mo), 250 kVA Silent DG Sets (₹65,000/mo), 45T Reach Stackers (₹4,50,000/mo).
  3. Enterprise IT Computing: Dell PowerEdge R750 High-Density Servers (₹42,000/mo), MacBook Pro M4 Developer Fleets (₹18,500/mo/unit), NetApp AFF A250 Storage Arrays (₹75,000/mo), Cisco Catalyst 9200 Stacks (₹16,000/mo), Lenovo ThinkStation P620 (₹24,000/mo), Polycom Video Suites (₹22,000/mo).
- Core Financial Terms:
  - ₹0 Down Payment / Zero Capital Expenditure.
  - 100% Tax-Deductible Operational Expense under Section 37(1) of the Income Tax Act.
  - Off-Balance Sheet purity adhering strictly to Ind AS 116.
  - 4-Hour binding term sheet delivery.
  - Guaranteed 48-Hour physical asset handover from our Ahmedabad staging hub.
  - Full OEM preventative maintenance, zero-downtime replacement SLAs, and 24/7 telematics monitoring included.
- Required Compliance Documents:
  - GST Registration Certificate (Form REG-06)
  - Company PAN Card
  - Income Tax Returns (ITR-5/6 with CA Computation) for last 2 financial years
  - Audited primary bank statements for last 12 consecutive months
  - Certificate of Incorporation & MOA/AOA

TONE & STYLE:
- Professional, concise, institutional, and polite. Swiss private-banking discretion combined with Gujarat commercial dynamism.
- Zero AI clichés (no "I'd be delighted to assist!", no robotic enthusiasm, no emojis).
- Provide crisp, actionable responses with direct markdown links:
  - [Browse Asset Catalogue](/lease)
  - [Apply for a Lease](/apply)
  - [Document Verification](/verify)
  - [About Firstgen](/about)
`;

function getLocalFallbackResponse(userMessage: string): string {
  const q = userMessage.toLowerCase();

  if (
    q.includes('document') ||
    q.includes('require') ||
    q.includes('paper') ||
    q.includes('kyc') ||
    q.includes('gst') ||
    q.includes('pan') ||
    q.includes('checklist')
  ) {
    return `To execute an operating lease with Firstgen Assets, we require standard statutory records:

1. **GST Registration Certificate** (Form REG-06)
2. **Company PAN Card** copy
3. **Income Tax Returns (ITR-5/6)** with CA computation for the last 2 financial years
4. **Primary Bank Statements** (audited) for the last 12 consecutive months
5. **Constitutional Records** (Certificate of Incorporation, MOA & AOA, or Partnership Deed)

All diligence is conducted 100% digitally in under 60 seconds. You can verify your documentation readiness on our [Document Verification Desk](/verify) or begin onboarding directly at [Apply for a Lease](/apply).`;
  }

  if (
    q.includes('48-hour') ||
    q.includes('48 hour') ||
    q.includes('fast') ||
    q.includes('delivery') ||
    q.includes('dispatch') ||
    q.includes('speed') ||
    q.includes('turnaround') ||
    q.includes('how fast')
  ) {
    return `Firstgen Assets operates a centralized staging and logistics facility on the SG Highway in Ahmedabad, Gujarat.

Our deployment timeline:
- **T+0 to 4 Hours:** Algorithmic credit evaluation and binding term sheet delivery.
- **T+12 Hours:** Digital agreement execution via eSign and eNACH mandate registration.
- **T+24 Hours:** Multi-point OEM pre-dispatch inspection, asset tagging, and telematics calibration.
- **T+48 Hours:** Physical handover at your designated corporate facility or job site with zero downtime SLAs.

Browse our [Asset Catalogue](/lease) to select assets available for immediate staging.`;
  }

  if (
    q.includes('luxury') ||
    q.includes('fleet') ||
    q.includes('rolls') ||
    q.includes('ghost') ||
    q.includes('mercedes') ||
    q.includes('s-class') ||
    q.includes('bmw') ||
    q.includes('range rover') ||
    q.includes('porsche') ||
    q.includes('car') ||
    q.includes('vehicle')
  ) {
    return `Our **Luxury Corporate Fleet** vertical is tailored for executive leadership, boardroom protocol, and visiting dignitaries:

- **Rolls-Royce Ghost Extended V12:** ₹4,20,000 / month (24–36 mo)
- **Mercedes-Benz S-Class Saloon:** ₹2,40,000 / month (24–36 mo)
- **Range Rover Vogue Autobiography:** ₹2,60,000 / month (24–36 mo)
- **BMW 7 Series Saloon:** ₹2,10,000 / month (24–36 mo)
- **Porsche Cayenne Twin-Turbo:** ₹1,80,000 / month (24–36 mo)
- **Audi A8 L Quattro:** ₹1,95,000 / month (24–36 mo)

Every luxury lease includes comprehensive zero-depreciation insurance, 24/7 roadside concierge, and quarterly detailing. Zero capex down payment required.

Compare all vehicles in our [Asset Catalogue](/lease?category=luxury-fleet) or submit an [Executive Application](/apply).`;
  }

  if (
    q.includes('construction') ||
    q.includes('warehouse') ||
    q.includes('crane') ||
    q.includes('excavator') ||
    q.includes('komatsu') ||
    q.includes('jcb') ||
    q.includes('forklift') ||
    q.includes('machinery') ||
    q.includes('heavy')
  ) {
    return `Our **Construction & Warehouse** vertical provides high-throughput heavy machinery with dedicated on-site field technicians:

- **40-Tonne Industrial Tower Crane:** ₹3,80,000 / month
- **Komatsu PC200 Hydraulic Excavator:** ₹2,10,000 / month
- **JCB 3CX Backhoe Loader:** ₹1,10,000 / month
- **Toyota 5-Tonne Electric Forklift:** ₹85,000 / month
- **Putzmeister Concrete Boom Pump:** ₹2,40,000 / month
- **45-Tonne Reach Stacker:** ₹4,50,000 / month

All heavy equipment leases include telematics health monitoring, quarterly hydraulic audits, and nationwide relocation support.

Inspect technical specifications in our [Asset Catalogue](/lease?category=construction-warehouse).`;
  }

  if (
    q.includes('it') ||
    q.includes('hardware') ||
    q.includes('server') ||
    q.includes('macbook') ||
    q.includes('laptop') ||
    q.includes('dell') ||
    q.includes('poweredge') ||
    q.includes('netapp') ||
    q.includes('cisco') ||
    q.includes('computer')
  ) {
    return `Our **Enterprise IT Hardware** vertical eliminates electronic equipment obsolescence and e-waste disposal liabilities:

- **Dell PowerEdge R750 High-Density Compute:** ₹42,000 / month
- **MacBook Pro M4 Workforce Fleet:** ₹18,500 / month per workstation
- **NetApp AFF A250 NVMe Storage Cluster:** ₹75,000 / month
- **Cisco Catalyst 9200 48-Port Stack:** ₹16,000 / month
- **Lenovo ThinkStation P620 Architecture Array:** ₹24,000 / month

Hardware leases incorporate next-business-day on-site component replacement and certified NIST 800-88 data sanitization at end-of-term.

Review details in our [Asset Catalogue](/lease?category=it-hardware).`;
  }

  if (
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('cost') ||
    q.includes('rent') ||
    q.includes('rate') ||
    q.includes('down payment') ||
    q.includes('deposit') ||
    q.includes('capex') ||
    q.includes('tax') ||
    q.includes('opex') ||
    q.includes('37(1)')
  ) {
    return `Firstgen operating leases offer substantial balance-sheet advantages over standard debt financing:

- **₹0 Down Payment:** Preserve 100% of your corporate cash reserves for expansion and working capital.
- **100% Tax Deductible:** Rental charges qualify as pure operational expenses under Section 37(1) of the Income Tax Act.
- **Ind AS 116 Compliant:** Pure operating architecture with zero residual write-down risk.
- **Flexible Tenure:** 12, 24, or 36-month custom lease cycles with scheduled refresh options.

To view itemized monthly rates across our 24 institutional assets, visit the [Asset Catalogue](/lease) or calculate your deployment at [Apply for a Lease](/apply).`;
  }

  if (q.includes('apply') || q.includes('contact') || q.includes('start') || q.includes('quote') || q.includes('begin')) {
    return `You can initiate an operating lease application through our digital portal:

1. Select your target asset and required quantity.
2. Choose your preferred tenure (12 to 36 months).
3. Provide your basic business identifiers (GSTIN and Corporate PAN).
4. Receive an automated credit scorecard and term sheet in minutes.

Ready to begin? Proceed directly to [Apply for a Lease](/apply). For statutory verification questions, visit [Document Verification](/verify).`;
  }

  return `Welcome to the Firstgen Concierge Desk. Firstgen Assets Private Limited provides institutional operating leases across India:

- **Executive Luxury Fleet** (Rolls-Royce, Mercedes-Benz, BMW, Range Rover)
- **Heavy Construction & Cranes** (40T Cranes, Komatsu Excavators, JCB Loaders)
- **Enterprise IT Hardware** (Dell PowerEdge, Apple M4 Fleets, NetApp Storage)

All 24 assets feature **₹0 down payment**, **100% tax-deductible OPEX**, and **48-hour delivery SLAs** from our Ahmedabad hub.

How may I assist your corporate capital deployment today? You may also explore our [Asset Catalogue](/lease) or [Apply for a Lease](/apply).`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m: { role: string; content: string }) => m.role === 'user');

    const promptText = lastUserMessage?.content || '';

    // If GEMINI_API_KEY is available, call Google Gemini 2.5 Flash
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const contents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents.length > 0 ? contents : promptText,
          config: {
            systemInstruction: FIRSTGEN_SYSTEM_PROMPT,
            maxOutputTokens: 800,
          },
        });

        const replyText = response.text?.trim();
        if (replyText) {
          return NextResponse.json({ reply: replyText });
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local responder:', err);
      }
    }

    // High-precision local fallback responder
    const fallbackReply = getLocalFallbackResponse(promptText);
    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { reply: getLocalFallbackResponse('help') },
      { status: 200 }
    );
  }
}
