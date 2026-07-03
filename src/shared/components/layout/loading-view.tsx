'use client';

import { Spinner } from '@/src/shared/components/ui/spinner';
import { cn } from '@/src/shared/lib/utils';

type LoadingViewProps = {
  variant?: 'screen' | 'inline';
  className?: string;
};

export function LoadingView({ variant = 'inline', className }: LoadingViewProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        variant === 'screen' ? 'min-h-screen w-full flex-1' : 'py-8',
        className,
      )}
    >
      <Spinner className="size-6" />
    </div>
  );
}
