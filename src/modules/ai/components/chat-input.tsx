'use client';

import { Button } from '@/src/shared/components/ui/button';
import { cn } from '@/src/shared/lib/utils';
import { SendIcon } from 'lucide-react';
import { type KeyboardEvent } from 'react';

type ChatInputProps = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="flex flex-row items-end gap-2 border-t border-border bg-background px-3 py-2 pb-4">
      <textarea
        placeholder="Escribe un mensaje..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        className={cn(
          'field-sizing-content max-h-32 min-h-8 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        )}
      />
      <Button
        size="icon"
        disabled={disabled || !value.trim()}
        onClick={onSend}
        aria-label="Enviar mensaje"
      >
        <SendIcon />
      </Button>
    </div>
  );
}
