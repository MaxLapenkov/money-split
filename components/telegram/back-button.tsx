"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWebApp } from "./web-app-provider";

/**
 * Карта BackButton по [[technical/routes-and-navigation-map]].
 * Возвращает `null` — кнопку скрыть; иначе — путь для `router.push`.
 */
export function getBackTarget(pathname: string): string | null {
  if (pathname === "/") return null;

  if (pathname === "/groups/new") return "/";

  const groupExpensesNew = pathname.match(
    /^\/groups\/([^/]+)\/expenses\/new$/,
  );
  if (groupExpensesNew) return `/groups/${groupExpensesNew[1]}`;

  const groupExpenses = pathname.match(/^\/groups\/([^/]+)\/expenses$/);
  if (groupExpenses) return `/groups/${groupExpenses[1]}`;

  const groupOnly = pathname.match(/^\/groups\/([^/]+)$/);
  if (groupOnly) return "/";

  return "/";
}

export function TelegramBackButton() {
  const { webApp } = useWebApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!webApp) return;

    const target = getBackTarget(pathname);

    const onBack = () => {
      if (target !== null) router.push(target);
    };

    if (target === null) {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(onBack);
    } else {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onBack);
    }

    return () => {
      webApp.BackButton.offClick(onBack);
    };
  }, [webApp, pathname, router]);

  return null;
}
