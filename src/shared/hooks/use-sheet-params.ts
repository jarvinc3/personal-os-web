import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

const sheetPushedByPath = new Map<string, boolean>();

function markSheetPushed(pathname: string) {
  sheetPushedByPath.set(pathname, true);
}

function clearSheetPushed(pathname: string) {
  sheetPushedByPath.delete(pathname);
}

function wasSheetPushed(pathname: string) {
  return sheetPushedByPath.get(pathname) === true;
}

function navigateSheetUrl(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  searchParams: URLSearchParams,
  sheetKey: string,
  open: boolean,
) {
  const currentSheet = searchParams.get("sheet");

  if (open) {
    if (currentSheet === sheetKey) {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.set("sheet", sheetKey);
    const url = `${pathname}?${next.toString()}`;

    if (currentSheet === null) {
      markSheetPushed(pathname);
      router.push(url);
    } else {
      router.replace(url);
    }

    return;
  }

  if (currentSheet !== sheetKey) {
    return;
  }

  if (wasSheetPushed(pathname)) {
    clearSheetPushed(pathname);
    router.back();
    return;
  }

  const next = new URLSearchParams(searchParams.toString());
  next.delete("sheet");
  const qs = next.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname);
}

export function useSheetParam(key: string) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const open = searchParams.get("sheet") === key;

  useEffect(() => {
    if (!open) {
      clearSheetPushed(pathname);
    }
  }, [open, pathname]);

  const setOpen = useCallback(
    (value: boolean) => {
      navigateSheetUrl(router, pathname, searchParams, key, value);
    },
    [searchParams, key, router, pathname],
  );

  return { open, setOpen };
}

export { navigateSheetUrl };
