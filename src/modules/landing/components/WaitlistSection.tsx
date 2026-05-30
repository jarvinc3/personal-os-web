"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { landingContent } from "../data/site-info";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="relative overflow-hidden px-6 py-24">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-surface">
        <div className="mx-auto h-px w-full max-w-7xl bg-border" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl border-2 border-text bg-white p-10 shadow-[8px_8px_0px_0px_var(--color-primary)]"
        >
          {/* Badge */}
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 border-text bg-accent px-3 py-1 text-xs font-bold text-primary shadow-[2px_2px_0px_0px_#111827]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {landingContent.waitlist.badge}
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {landingContent.waitlist.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            {landingContent.waitlist.description}
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border-2 border-success bg-success/10 p-6 text-center shadow-[4px_4px_0px_0px_var(--color-success)]"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-success bg-white text-2xl shadow-[2px_2px_0px_0px_var(--color-success)]">
                ✅
              </div>
              <p className="font-bold text-success">
                {landingContent.waitlist.successTitle}
              </p>
              <p className="text-sm font-medium text-text mt-1">
                {landingContent.waitlist.successMessage}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={landingContent.waitlist.inputPlaceholder}
                  required
                  className="w-full flex-1 rounded-xl border-2 border-text bg-white px-4 py-3 text-sm font-bold text-text shadow-[4px_4px_0px_0px_#111827] outline-none placeholder:text-muted-foreground focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all sm:w-auto"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-text bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[4px_4px_0px_0px_#111827] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#111827] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none sm:w-auto disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#111827]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {landingContent.waitlist.buttonLoading}
                    </span>
                  ) : (
                    landingContent.waitlist.buttonDefault
                  )}
                </button>
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground text-center">
                {landingContent.waitlist.footerNote}
              </p>
            </form>
          )}

          {/* Social proof */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-8">
            {landingContent.waitlist.trustBadges.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-1.5 rounded-full border-2 border-text bg-white px-3 py-1 text-xs font-bold text-text shadow-[2px_2px_0px_0px_#111827]"
              >
                <span>{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
