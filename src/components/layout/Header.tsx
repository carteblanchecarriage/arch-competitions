"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth/AuthButton";

const NAV_ITEMS = [
  { label: "Competitions", href: "/competitions" },
  { label: "Create", href: "/create" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold italic tracking-tight text-gray-900">
            Counterparti
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-gray-500 transition-colors hover:text-[#111]"
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-2 border-l border-gray-200 pl-6">
            <AuthButton />
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center  text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-gray-200 bg-white transition-all duration-200 md:hidden",
          mobileOpen ? "max-h-112" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col px-4 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-gray-500 hover:text-[#111]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-gray-200 px-3 pt-3">
            <AuthButton variant="inline" />
          </div>
        </nav>
      </div>
    </header>
  );
}
