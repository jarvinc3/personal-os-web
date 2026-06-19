import { cn } from '@/src/shared/lib/utils';
import type { ReactNode } from 'react';

type SettingsSectionProps = {
  title: string;
  description?: string;
  className?: string;
  bare?: boolean;
  children: ReactNode;
};

export function SettingsSection({
  title,
  description,
  className,
  bare = false,
  children,
}: SettingsSectionProps) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-col gap-0.5 px-1">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {bare ? children : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">{children}</div>
      )}
    </section>
  );
}
