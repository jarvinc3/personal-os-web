'use client';

import { getChatSuggestionsForModule } from '@/src/modules/ai/constants/chat-suggestions';
import type { ModuleChatSlug } from '@/src/modules/ai/types/chat.types';
import { Button } from '@/src/shared/components/ui/button';
import { useMemo } from 'react';

type ChatEmptySuggestionsProps = {
  moduleSlug: ModuleChatSlug;
  disabled?: boolean;
  onSelect: (prompt: string) => void;
};

export function ChatEmptySuggestions({
  moduleSlug,
  disabled,
  onSelect,
}: ChatEmptySuggestionsProps) {
  const suggestions = useMemo(
    () => getChatSuggestionsForModule(moduleSlug),
    [moduleSlug],
  );

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 px-2 py-8">
      <div className="flex flex-col items-center justify-center gap-1">
        <p className="text-base font-semibold text-foreground">
          ¿En qué puedo ayudarte?
        </p>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Puedo cambiar tu perfil, preferencias, tema, notificaciones y configuración de módulos.
        </p>
      </div>

      <div className="flex flex-row flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.id}
            variant="outline"
            size="sm"
            disabled={disabled}
            className="rounded-full"
            onClick={() => onSelect(suggestion.prompt)}
          >
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
