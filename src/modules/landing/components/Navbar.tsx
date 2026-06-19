"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AppLogo } from "@/src/shared/components/brand/app-logo";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";

import { landingContent } from "../data/site-info";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? "border-b-2 border-text bg-white/95 backdrop-blur-md shadow-[0px_4px_0px_0px_#111827]"
          : "bg-transparent"
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <AppLogo
            size="sm"
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
          />
          <span className="text-sm font-semibold tracking-tight">
            {landingContent.nav.logoText}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {landingContent.nav.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={APP_ROUTES.auth.login}
            className="rounded-xl border-2 border-text bg-white px-4 py-2 text-sm font-bold text-text shadow-[2px_2px_0px_0px_#111827] transition-all duration-200 hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_0px_#111827]"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/#waitlist"
            className="group relative overflow-hidden rounded-xl border-2 border-text bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[4px_4px_0px_0px_#111827] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#111827] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <span className="relative z-10">{landingContent.nav.cta}</span>
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-foreground transition-all duration-300 ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b-2 border-text bg-white shadow-[0px_8px_0px_0px_#111827] md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {landingContent.nav.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={APP_ROUTES.auth.login}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-white/5"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/#waitlist"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-xl border-2 border-text bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground shadow-[2px_2px_0px_0px_#111827]"
              >
                {landingContent.nav.mobileCta}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
