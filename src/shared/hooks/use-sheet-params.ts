import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useSheetParam(key: string) {
   const searchParams = useSearchParams();
   const router = useRouter();
   const pathname = usePathname();

   const open = searchParams.get("sheet") === key;

   const setOpen = useCallback(
      (value: boolean) => {
         const next = new URLSearchParams(searchParams.toString());

         if (value) {
            next.set("sheet", key);
         } else {
            next.delete("sheet");
         }

         const qs = next.toString();
         router.push(qs ? `${pathname}?${qs}` : pathname);
      },
      [searchParams, key, router, pathname],
   );

   return { open, setOpen };
}