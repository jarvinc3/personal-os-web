"use client"

import { AVATAR_OPTIONS } from "@/src/modules/settings/constants/avatar-options"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import { Contact2 } from "lucide-react"
import Image from "next/image"

type EditAccountAvatarSectionProps = {
  value: string
  onChange: (value: string) => void
}

export function EditAccountAvatarSection({
  value,
  onChange,
}: EditAccountAvatarSectionProps) {
  return (
    <SummarySection title="Avatar" icon={Contact2}>
      <ChoiceGrid
        value={value}
        onValueChange={onChange}
        ariaLabel="Avatar"
        accentColor={SETTINGS_REGISTRY.account.accent}
        columns={4}
        options={AVATAR_OPTIONS.map((avatar) => ({
          value: avatar.url,
          label: `Avatar ${Number(avatar.id) + 1}`,
          media: (
            <Image
              src={avatar.url}
              alt=""
              width={80}
              height={80}
              className="size-full object-cover"
              unoptimized
            />
          ),
        }))}
      />
    </SummarySection>
  )
}
