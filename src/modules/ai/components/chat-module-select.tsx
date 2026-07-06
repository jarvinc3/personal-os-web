'use client';

import {
  CHAT_MODULE_OPTIONS,
  type ModuleChatSlug,
} from '@/src/modules/ai/types/chat.types';
import { SelectField } from '@/src/shared/components/layout/form-blocks';

type ChatModuleSelectProps = {
  value: ModuleChatSlug;
  onChange: (slug: ModuleChatSlug) => void;
  disabled?: boolean;
};

export function ChatModuleSelect({ value, onChange, disabled }: ChatModuleSelectProps) {
  return (
    <SelectField
      label="Contexto del agente"
      value={value}
      onChange={(next) => onChange(next as ModuleChatSlug)}
      disabled={disabled}
      options={CHAT_MODULE_OPTIONS.map((option) => ({
        value: option.slug,
        label: option.label,
      }))}
    />
  );
}
