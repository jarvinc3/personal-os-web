import Link from "next/link";

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  breadcrumb?: { href: string; label: string }[];
}

export function PageHeader({
  label,
  title,
  description,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="overflow-hidden relative bg-white border-b-2 border-text">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-surface">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative px-6 py-20 pt-32 mx-auto max-w-4xl text-center">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav className="flex gap-2 justify-center items-center mb-6 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Personal OS
            </Link>
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex gap-2 items-center">
                <span>/</span>
                {i === breadcrumb.length - 1 ? (
                  <span className="text-foreground">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Label */}
        {label && (
          <span className="mb-4 inline-block rounded-full border-2 border-text bg-accent px-3 py-1 text-xs font-bold text-primary shadow-[2px_2px_0px_0px_#111827]">
            {label}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
