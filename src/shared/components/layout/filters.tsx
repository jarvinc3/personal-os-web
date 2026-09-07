import { SearchIcon, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type FilterSearchToolbarProps = {
   searchValue?: string;
   onSearchChange?: (value: string) => void;
   searchPlaceholder?: string;
   activeFilterCount: number;
   onFilterPress: () => void;
   hideSearch?: boolean;
   className?: string;
};
function FilterSearchToolbar({
   searchValue = '',
   onSearchChange,
   searchPlaceholder = 'Buscar...',
   activeFilterCount,
   onFilterPress,
   hideSearch = false,
   className,
}: FilterSearchToolbarProps) {
   return (
      <div className={cn('flex flex-row gap-2 items-center', className)}>
         {hideSearch ? null : (
            <div className="relative flex-1 min-w-0">
               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
               <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                  className="pr-3 pl-8"
               />
            </div>
         )}
         <FilterTriggerButton activeCount={activeFilterCount} onClick={onFilterPress} />
      </div>
   );
}

type FilterTriggerButtonProps = {
   activeCount: number;
   onClick: () => void;
   accessibilityLabel?: string;
   className?: string;
   variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
};

function FilterTriggerButton({
   activeCount,
   onClick,
   accessibilityLabel = 'Abrir filtros',
   className,
   variant = 'outline',
}: FilterTriggerButtonProps) {
   return (
      <Button
         size="icon"
         aria-label={accessibilityLabel}
         variant={variant}
         onClick={onClick}
         className={cn('relative rounded-full size-9 shrink-0', className)}
      >
         <SlidersHorizontal className="size-4 text-foreground" />
         {activeCount > 0 ? (
            <Badge
               variant="default"
               className="absolute -right-1 -top-1 min-h-4.5 min-w-4.5 border-0 px-1">
               <span className="text-[10px] font-semibold leading-none text-primary-foreground">
                  {activeCount > 9 ? '9+' : activeCount}
               </span>
            </Badge>
         ) : null}
      </Button>
   );
}

export { FilterSearchToolbar, FilterTriggerButton };
export type { FilterSearchToolbarProps, FilterTriggerButtonProps };
