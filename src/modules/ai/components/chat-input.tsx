'use client';

import { Button } from '@/src/shared/components/ui/button';
import { Textarea } from '@/src/shared/components/ui/textarea';
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
    <div className="flex flex-row items-end gap-0.5 px-3 py-2 pb-4 border-t border-border bg-background">
      <Textarea
        placeholder="Escribe un mensaje..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        className="overflow-y-auto min-h-10 p-3 max-h-32 rounded-4xl scrollbar-hide"
      />
      <Button
        size="icon"
        disabled={disabled || !value.trim()}
        onClick={onSend}
        className="rounded-full size-10"
        aria-label="Enviar mensaje"
      >
        <SendIcon />
      </Button>
    </div>
  );
}
