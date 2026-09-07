import { Button } from '@/src/shared/components/ui/button';
import { cn } from '@/src/shared/lib/utils';
import { ArrowDownLeftIcon, ArrowRightLeftIcon, ArrowUpRightIcon, ChevronDownIcon, CreditCardIcon } from 'lucide-react';

type FinanceHomeHeroProps = {
  balanceLabel: string;
  balanceAmount: string;
  pendingHoldLabel?: string;
  cashFlowLabel?: string;
  onAccountPress?: () => void;
  onSendPress?: () => void;
  onReceivePress?: () => void;
  className?: string;
};

function FinanceHomeGridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.35]">
      {Array.from({ length: 14 }, (_, row) => (
        <div
          key={`row-${row}`}
          className="absolute right-0 left-0 border-t border-border"
          style={{ top: row * 28 }}
        />
      ))}
      {Array.from({ length: 30 }, (_, col) => (
        <div
          key={`col-${col}`}
          className="absolute top-0 bottom-0 border-l border-border"
          style={{ left: col * 35 }}
        />
      ))}
    </div>
  );
}

export function FinanceHomeHero({
  balanceLabel,
  balanceAmount,
  pendingHoldLabel,
  cashFlowLabel,
  onAccountPress,
  onSendPress,
  onReceivePress,
  className,
}: FinanceHomeHeroProps) {
  return (
    <div className={cn('overflow-hidden relative', className)}>
      <FinanceHomeGridPattern />
      <div className="flex relative flex-col gap-3 px-4 pt-4 pb-6 w-full">
        <Button
          variant="ghost"
          onClick={onAccountPress}
          className="flex-row gap-2 justify-center items-center self-center active:opacity-70"
        >
          <CreditCardIcon className="text-success" />
          <span className="text-base font-medium text-foreground">{balanceLabel}</span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>

        <h2 className="text-4xl font-bold tabular-nums tracking-tight text-center text-foreground">
          {balanceAmount}
        </h2>

        {pendingHoldLabel ? (
          <div className="self-center rounded-full bg-background/80 px-4 py-1.5">
            <span className="text-sm text-muted-foreground">{pendingHoldLabel || '0'}</span>
          </div>
        ) : null}

        {cashFlowLabel ? (
          <div className="self-center rounded-full bg-background/80 px-4 py-1.5">
            <span className="text-sm text-muted-foreground">{cashFlowLabel}</span>
          </div>
        ) : null}

        <div className="overflow-hidden grid grid-cols-3 gap-0.5 rounded-2xl border border-border">
          <Button
            variant="outline"
            onClick={onSendPress}
            className="flex-1 rounded-none rounded-l-2xl"
          >
            <ArrowUpRightIcon className="text-foreground" />
            <span className="text-base font-semibold text-foreground">Gasto</span>
          </Button>
          <Button
            variant="outline"
            onClick={onReceivePress}
            className="flex-1 rounded-none"
          >
            <ArrowDownLeftIcon className="text-foreground" />
            <span className="text-base font-semibold text-foreground">Ingreso</span>
          </Button>
          <Button
            variant="outline"
            onClick={onReceivePress}
            className="flex-1 rounded-none rounded-r-2xl"
          >
            <ArrowRightLeftIcon className="text-foreground" />
            <span className="text-base font-semibold text-foreground">Transf.</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
