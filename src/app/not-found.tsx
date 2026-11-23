import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-[#0E0F11] text-[#F4F2EE] flex flex-col justify-between selection:bg-[#C27D4B] selection:text-[#0E0F11]">
      <Navbar />

      <section className="flex-1 flex items-center justify-center px-6 py-32 md:py-44">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-[#C27D4B] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#C27D4B]" />
            <span>404 Protocol // Resource Not Found</span>
          </div>

          <h1 className="font-sans font-bold text-5xl sm:text-6xl md:text-7xl tracking-tighter text-[#F4F2EE] mb-6">
            Endpoint Offline.
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-[#F4F2EE]/70 max-w-lg mx-auto mb-10 leading-relaxed">
            The requested asset specification or corporate registry does not exist at this address.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#C27D4B] hover:bg-[#a66538] text-[#0E0F11] font-mono text-xs uppercase tracking-widest font-semibold transition-all shadow-lg"
            >
              Return to Headquarters
            </Link>
            <Link
              href="/lease"
              className="w-full sm:w-auto px-8 py-3.5 border border-[#C27D4B]/40 hover:border-[#C27D4B] text-[#F4F2EE] font-mono text-xs uppercase tracking-widest font-medium transition-all"
            >
              Explore Asset Catalogue
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
