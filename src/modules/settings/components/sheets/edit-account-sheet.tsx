'use client';

import { AVATAR_OPTIONS, type AvatarOption } from '@/src/modules/settings/constants/avatar-options';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import { useProfileSheetFormSync } from '@/src/modules/settings/hooks/use-profile-sheet';
import type { UpdateProfilePayload } from '@/src/modules/settings/types/profile.types';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { AppSheet, AppSheetFooter } from '@/src/shared/components/app-sheet';
import { FormSection, FormTextField, SelectionGrid } from '@/src/shared/components/form-blocks';
import { appToast } from '@/src/shared/lib/app-toast';
import { createSheetSubmit } from '@/src/shared/lib/sheet-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Contact, Contact2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  fullName: z.string().trim().min(2, 'El nombre es obligatorio'),
});

type FormValues = z.infer<typeof schema>;

type EditAccountSheetProps = SettingsSheetProps & {
  email: string;
};

export function EditAccountSheet({ open, onOpenChange, email }: EditAccountSheetProps) {
  const { profileQuery, updateProfileMutation } = useProfile();

  const savedFullName = profileQuery.data?.fullName ?? '';
  const savedAvatarUrl = profileQuery.data?.avatarUrl ?? '';
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(savedAvatarUrl);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty: isNameDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: savedFullName },
  });

  const formValues = useMemo(() => ({ fullName: savedFullName }), [savedFullName]);
  useProfileSheetFormSync(open, reset, formValues);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedAvatarUrl(savedAvatarUrl);
    }
    onOpenChange(nextOpen);
  };

  const isAvatarDirty = selectedAvatarUrl !== savedAvatarUrl;
  const isDirty = isNameDirty || isAvatarDirty;
  const canSave = isDirty && (!isAvatarDirty || Boolean(selectedAvatarUrl));

  const submitForm = useMemo(() => createSheetSubmit(handleSubmit), [handleSubmit]);

  const onSubmit = submitForm(async (values) => {
    const payload: UpdateProfilePayload = {};

    if (values.fullName !== savedFullName) {
      payload.fullName = values.fullName;
    }
    if (isAvatarDirty && selectedAvatarUrl) {
      payload.avatarUrl = selectedAvatarUrl;
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    await updateProfileMutation.mutateAsync(payload);
    appToast.success({
      text1: 'Cuenta actualizada',
      text2: 'Tu perfil se guardó correctamente.',
    });
    onOpenChange(false);
  });

  return (
    <AppSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Cuenta"
      description="Nombre y avatar de tu perfil."
      className="sm:max-w-lg"
      footer={
        <AppSheetFooter
          isPending={updateProfileMutation.isPending}
          disabled={!canSave}
          onSave={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      }
    >
      <FormSection title="Nombre completo" icon={Contact}>
        <Controller
          control={control}
          name="fullName"
          render={({ field }) => (
            <FormTextField
              autoComplete="name"
              placeholder="¿Cómo te llamas?"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={updateProfileMutation.isPending}
              error={errors.fullName?.message}
            />
          )}
        />
        <div className="rounded-2xl bg-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">Correo</p>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </div>
      </FormSection>

      <FormSection title="Avatar" icon={Contact2}>
        <SelectionGrid
          items={AVATAR_OPTIONS}
          value={selectedAvatarUrl}
          onValueChange={setSelectedAvatarUrl}
          getItemKey={(item: AvatarOption) => item.id}
          getItemValue={(item: AvatarOption) => item.url}
          renderCell={(item: AvatarOption) => (
            <Image
              src={item.url}
              alt="Opción de avatar"
              width={80}
              height={80}
              className="size-full object-cover"
              unoptimized
            />
          )}
        />
      </FormSection>
    </AppSheet>
  );
}
