import { Switch } from '@/src/shared/components/ui/switch';
import { cn } from '@/src/shared/lib/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react';
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
        <h2 className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
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

type SettingsRowProps = {
  label: string;
  value?: string;
  accentColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  trailing?: ReactNode;
  isLast?: boolean;
  icon?: LucideIcon;
};

export function SettingsRow({
  label,
  value,
  accentColor,
  onPress,
  showChevron,
  destructive = false,
  disabled = false,
  switchValue,
  onSwitchChange,
  trailing,
  isLast = false,
  icon: Icon,
}: SettingsRowProps) {
  const hasSwitch = onSwitchChange !== undefined;
  const showChevronIcon = (showChevron ?? Boolean(onPress)) && !hasSwitch;
  const rowClassName = cn(
    'flex min-h-[52px] w-full flex-row items-center gap-3 p-3',
    !isLast && 'border-b border-border/60',
    disabled && 'opacity-50',
  );

  const content = (
    <div className="flex flex-row gap-3 justify-between items-center w-full">
      {Icon && (
        <div
          className={cn("flex justify-center items-center rounded-md size-9 shrink-0 bg-muted")}
          style={{ backgroundColor: accentColor + '20' }}
        >
          <Icon className={cn("size-[18px]", destructive && 'text-destructive')} color={accentColor} />
        </div>
      )}
      <div className="flex flex-col flex-1 gap-1 justify-start text-left md:flex-row md:items-center md:justify-between md:gap-3">
        <span className={cn('text-sm md:text-base', destructive && 'text-destructive')}>
          {label}
        </span>
        {value && (
          <span className="max-w-[90%] truncate text-xs text-muted-foreground md:text-right">
            {value}
          </span>
        )}
      </div>
      {trailing}
      {hasSwitch && (
        <Switch
          checked={switchValue ?? false}
          onCheckedChange={onSwitchChange}
          disabled={disabled}
        />
      )}
      {showChevronIcon && !hasSwitch && (
        <ChevronRight className="size-[18px] text-muted-foreground" />
      )}
    </div>
  );

  if (hasSwitch || disabled || !onPress) {
    return <div className={rowClassName}>{content}</div>;
  }

  return (
    <button
      type="button"
      className={cn(rowClassName, 'hover:bg-muted/50 active:scale-[0.99] transition-all cursor-pointer')}
      onClick={onPress}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
