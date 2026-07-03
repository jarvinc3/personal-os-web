import Link from "next/link";

import { AppLogo } from "@/src/shared/components/brand/app-logo";
import { landingContent, siteInfo } from "../data/site-info";

export function Footer() {
  return (
    <footer className="relative mt-32 bg-white border-t-2 border-text">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 h-40 bg-transparent pointer-events-none" />

      <div className="px-6 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="group mb-4 flex items-center gap-2.5">
              <AppLogo
                size="md"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
              <span className="text-base font-semibold tracking-tight">
                {siteInfo.name}
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {landingContent.footer.description}
            </p>
            <div className="flex gap-3 items-center">
              <a
                href={`mailto:${siteInfo.email}`}
                className="text-sm transition-colors text-muted-foreground hover:text-foreground"
              >
                {siteInfo.email}
              </a>
            </div>
          </div>

          {/* Links columns */}
          {landingContent.footer.columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 justify-between items-center pt-8 mt-12 border-t-2 border-text sm:flex-row">
          <p className="text-xs font-bold text-text">
            {siteInfo.copyright}
          </p>
          <div className="flex gap-2 items-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-success bg-success/10 px-2.5 py-1 text-xs font-bold text-success shadow-[2px_2px_0px_0px_var(--color-success)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="inline-flex absolute w-full h-full rounded-full opacity-75 animate-ping bg-success" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              {siteInfo.statusBadge}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
