'use client';

import { Button } from '@/src/shared/components/ui/button';
import { ScrollArea } from '@/src/shared/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/src/shared/components/ui/sheet';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { cn } from '@/src/shared/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type AppSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AppSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: AppSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn('flex w-full flex-col gap-0 sm:max-w-md', className)}>
        <AppSheetHeader title={title} description={description} />
        <AppSheetBody>{children}</AppSheetBody>
        {footer ? <div className="mt-auto border-t border-border p-4">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  );
}

export function AppSheetHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <SheetHeader className="border-b border-border pb-4 text-center">
      <SheetTitle>{title}</SheetTitle>
      {description ? <SheetDescription>{description}</SheetDescription> : null}
    </SheetHeader>
  );
}

export function AppSheetBody({ children }: { children: ReactNode }) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 p-4">{children}</div>
    </ScrollArea>
  );
}

type AppSheetFooterProps = {
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  disabled?: boolean;
};

export function AppSheetFooter({
  onSave,
  onCancel,
  saveLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  isPending = false,
  disabled = false,
}: AppSheetFooterProps) {
  return (
    <SheetFooter className="flex flex-row gap-2 sm:justify-end">
      {onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          {cancelLabel}
        </Button>
      ) : null}
      <Button type="button" onClick={onSave} disabled={disabled || isPending}>
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {saveLabel}
      </Button>
    </SheetFooter>
  );
}
