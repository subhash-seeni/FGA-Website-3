'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getAssetPath } from '@/lib/basePath';

interface NavbarProps {
  theme?: 'dark' | 'light' | 'auto';
  onBeginLease?: () => void;
}

export default function Navbar({ theme = 'auto', onBeginLease }: NavbarProps) {
  const pathname = usePathname();

  // Helper to determine initial/default theme based on route
  const getRouteDefaultTheme = useCallback(
    (path?: string | null): 'dark' | 'light' => {
      if (theme === 'dark' || theme === 'light') return theme;
      if (!path) return 'light';
      if (path.startsWith('/verify') || path.startsWith('/apply') || path.startsWith('/lease')) {
        return 'dark';
      }
      return 'light'; // '/' and '/about'
    },
    [theme]
  );

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>(() =>
    getRouteDefaultTheme(pathname)
  );

  useEffect(() => {
    if (theme !== 'auto') {
      setCurrentTheme(theme);
      return;
    }

    const defaultTheme = getRouteDefaultTheme(pathname);
    setCurrentTheme(defaultTheme);

    const checkNavTheme = () => {
      const isScrolled = window.scrollY > 30;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));

      // Check all elements with data-nav-theme or data-theme
      const elements = document.querySelectorAll<HTMLElement>('[data-nav-theme], [data-theme]');
      const navY = 60;
      let matchedTheme: 'dark' | 'light' | null = null;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= navY && rect.bottom >= navY) {
          const t = el.getAttribute('data-nav-theme') || el.getAttribute('data-theme');
          if (t === 'light' || t === 'dark') {
            matchedTheme = t;
            break;
          }
        }
      }

      if (matchedTheme) {
        setCurrentTheme((prev) => (prev !== matchedTheme ? matchedTheme : prev));
      } else {
        // Fallback to route default theme
        setCurrentTheme((prev) => (prev !== defaultTheme ? defaultTheme : prev));
      }
    };

    // Throttle scroll checks with requestAnimationFrame to prevent layout thrashing
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkNavTheme();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Event listener for custom crossfade events (e.g. pinned Act 1)
    const handleCustomThemeChange = (e: Event) => {
      const customEvt = e as CustomEvent<'light' | 'dark'>;
      if (customEvt.detail === 'light' || customEvt.detail === 'dark') {
        setCurrentTheme((prev) => (prev !== customEvt.detail ? customEvt.detail : prev));
      }
    };

    checkNavTheme();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('nav-theme-change', handleCustomThemeChange);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('nav-theme-change', handleCustomThemeChange);
    };
  }, [theme, pathname, getRouteDefaultTheme]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Lease', href: '/lease' },
    { label: 'Apply', href: '/apply' },
    { label: 'Verify', href: '/verify' },
  ];

  const isDark = currentTheme === 'dark';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark
              ? 'py-3.5 bg-[#0E0F11]/85 backdrop-blur-md border-b border-[#C27D4B]/20 shadow-2xl'
              : 'py-3.5 bg-[#F4F2EE]/85 backdrop-blur-md border-b border-[#0E0F11]/10 shadow-sm'
            : isDark
            ? 'py-5 bg-transparent border-b border-white/[0.04]'
            : 'py-5 bg-transparent border-b border-[#0E0F11]/[0.08]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Left: Brand Logo using firstgen-logo-transparent */}
          <Link href="/" className="group flex items-center select-none" aria-label="Firstgen Assets Homepage">
            <div className="relative h-8 md:h-9 w-40 md:w-48">
              <Image
                src={getAssetPath('/images/firstgen-logo-transparent.png')}
                alt="Firstgen Assets"
                fill
                className="object-contain object-left transition-all duration-300"
                style={{
                  filter: isDark ? 'invert(1) hue-rotate(180deg)' : 'none',
                }}
                priority
              />
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.16em] transition-colors duration-200 font-mono relative py-1 group ${
                    isActive
                      ? 'text-[#C27D4B] font-semibold'
                      : isDark
                      ? 'text-[#F4F2EE]/80 hover:text-[#C27D4B]'
                      : 'text-[#0E0F11] hover:text-[#C27D4B] font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 h-[1.5px] bg-[#C27D4B] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Minimal Pill CTA & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/lease"
              onClick={() => {
                if (onBeginLease) onBeginLease();
              }}
              className={`relative inline-flex items-center justify-center px-4 md:px-5 py-2 text-xs font-mono uppercase tracking-[0.15em] rounded-full transition-all duration-300 active:scale-[0.98] ${
                isDark
                  ? 'text-[#F4F2EE] border border-[#C27D4B]/80 hover:bg-[#C27D4B] hover:text-[#0E0F11] hover:border-[#C27D4B]'
                  : 'text-[#0E0F11] border border-[#0E0F11]/80 hover:bg-[#0E0F11] hover:text-[#F4F2EE] hover:border-[#0E0F11]'
              }`}
            >
              Begin Lease
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 focus:outline-none transition-colors ${
                isDark ? 'text-[#F4F2EE] hover:text-[#C27D4B]' : 'text-[#0E0F11] hover:text-[#C27D4B]'
              }`}
              aria-label="Toggle navigation menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="7" x2="21" y2="7" />
                    <line x1="3" y1="17" x2="21" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sleek Full-Screen Obsidian Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-[#0E0F11] md:hidden flex flex-col justify-between p-8 transition-transform duration-500 ease-in-out ${
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="pt-20 flex flex-col gap-6">
          <div className="pb-4 border-b border-[#C27D4B]/20">
            <div className="relative h-8 w-44 mb-2">
              <Image
                src={getAssetPath('/images/firstgen-logo-transparent.png')}
                alt="Firstgen Assets"
                fill
                className="object-contain object-left"
                style={{ filter: 'invert(1) hue-rotate(180deg)' }}
              />
            </div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#C27D4B]">
              AHMEDABAD • GUJARAT • INDIA
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {navLinks.map((link, idx) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-baseline justify-between py-2 border-b border-white/[0.06] text-lg font-light transition-colors ${
                    isActive
                      ? 'text-[#C27D4B] font-medium'
                      : 'text-[#F4F2EE] hover:text-[#C27D4B]'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className={`font-mono text-xs ${isActive ? 'text-[#C27D4B]' : 'text-[#C27D4B]/60'}`}>
                    0{idx + 1}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="pb-8 flex flex-col gap-4">
          <Link
            href="/lease"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full py-3.5 text-center font-mono text-xs uppercase tracking-[0.2em] bg-[#C27D4B] text-[#0E0F11] font-medium rounded-full"
          >
            Begin Lease Protocol
          </Link>

          <div className="flex justify-between items-center text-[10px] font-mono text-[#F4F2EE]/40 uppercase tracking-widest pt-2">
            <span>Corporate CIN: U65929GJ</span>
            <span className="text-[#C27D4B]">Gujarat Jurisdiction</span>
          </div>
        </div>
      </div>
    </>
  );
}
