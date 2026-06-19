'use client';

import { Switch } from '@/src/shared/components/ui/switch';
import { cn } from '@/src/shared/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  trailing?: ReactNode;
  isLast?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgClass?: string;
};

export function SettingsRow({
  label,
  value,
  onPress,
  showChevron,
  destructive = false,
  disabled = false,
  switchValue,
  onSwitchChange,
  trailing,
  isLast = false,
  icon: Icon,
  iconColor,
  iconBgClass: _iconBgClass,
}: SettingsRowProps) {
  const hasSwitch = onSwitchChange !== undefined;
  const showChevronIcon = (showChevron ?? Boolean(onPress)) && !hasSwitch;
  const rowClassName = cn(
    'flex min-h-[52px] w-full flex-row items-center gap-3 px-4 py-3',
    !isLast && 'border-b border-border/60',
    disabled && 'opacity-50',
  );

  const content = (
    <>
      {Icon ? (
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted"
          style={iconColor ? { backgroundColor: `${iconColor}1a` } : undefined}
        >
          <Icon className="size-[18px]" style={{ color: iconColor }} />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-row items-center justify-between gap-3">
        <span className={cn('text-base', destructive ? 'text-destructive' : 'text-foreground')}>
          {label}
        </span>
        {value ? (
          <span className="max-w-[45%] truncate text-right text-xs text-muted-foreground">
            {value}
          </span>
        ) : null}
      </div>
      {trailing}
      {hasSwitch ? (
        <Switch
          checked={switchValue ?? false}
          onCheckedChange={onSwitchChange}
          disabled={disabled}
        />
      ) : null}
      {showChevronIcon && !hasSwitch ? (
        <ChevronRight className="size-[18px] text-muted-foreground" />
      ) : null}
    </>
  );

  if (hasSwitch || disabled || !onPress) {
    return <div className={rowClassName}>{content}</div>;
  }

  return (
    <button type="button" className={cn(rowClassName, 'hover:bg-muted/50')} onClick={onPress}>
      {content}
    </button>
  );
}
