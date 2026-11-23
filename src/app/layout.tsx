import type { Metadata } from 'next';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import LeaseConcierge from '@/components/LeaseConcierge';
import './globals.css';

export const metadata: Metadata = {
  title: 'Firstgen Assets Private Limited | Operating Lease Infrastructure | Ahmedabad',
  description:
    'Institutional operating lease platform in Ahmedabad, Gujarat for Luxury Corporate Fleet, Construction & Warehouse Heavy Machinery, and Enterprise IT Hardware. Off-balance sheet capital solutions with 48-hour SLA deployment.',
  keywords: [
    'Operating Lease India',
    'Equipment Leasing Ahmedabad',
    'Corporate Luxury Fleet Lease',
    'Construction Machinery Lease Gujarat',
    'Enterprise IT Hardware Leasing',
    'Firstgen Assets',
    'Off Balance Sheet Capex',
  ],
  authors: [{ name: 'Firstgen Assets Private Limited' }],
  icons: {
    icon: '/images/firstgen-logo-transparent.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#0E0F11] text-[#F4F2EE] min-h-screen selection:bg-[#C27D4B] selection:text-[#0E0F11]">
        <SmoothScrollProvider>
          {children}
          <LeaseConcierge />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
