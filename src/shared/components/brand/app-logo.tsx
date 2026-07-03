import Image from "next/image";

import { appAssets } from "@/src/shared/constants/app-assets";
import { cn } from "@/src/shared/lib/utils";

const sizes = {
  xs: { className: "size-6", px: 20 },
  sm: { className: "size-8", px: 28 },
  md: { className: "size-9", px: 36 },
  lg: { className: "size-10", px: 44 },
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
        "overflow-hidden relative rounded-xl shrink-0",
        sizeClass,
        className,
      )}
    >
      <Image
        src={appAssets.iconLight}
        alt=""
        width={px}
        height={px}
        className="object-cover size-full dark:hidden"
        priority={size === "sm"}
      />
      <Image
        src={appAssets.iconDark}
        alt=""
        width={px}
        height={px}
        className="hidden object-cover size-full dark:block"
      />
    </span>
  );
}
