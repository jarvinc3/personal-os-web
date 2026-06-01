import Image from "next/image";

import { appAssets } from "@/src/shared/constants/app-assets";
import { cn } from "@/src/shared/lib/utils";

const sizes = {
  sm: { className: "size-8", px: 32 },
  md: { className: "size-9", px: 36 },
} as const;

type AppLogoProps = {
  size?: keyof typeof sizes;
  className?: string;
};

export function AppLogo({ size = "sm", className }: AppLogoProps) {
  const { className: sizeClass, px } = sizes[size];

  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl",
        sizeClass,
        className,
      )}
    >
      <Image
        src={appAssets.iconLight}
        alt=""
        width={px}
        height={px}
        className="size-full object-cover dark:hidden"
        priority={size === "sm"}
      />
      <Image
        src={appAssets.iconDark}
        alt=""
        width={px}
        height={px}
        className="hidden size-full object-cover dark:block"
      />
    </span>
  );
}
