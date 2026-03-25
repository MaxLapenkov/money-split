"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWebApp } from "./web-app-provider";

export function TelegramBackButton() {
  const { webApp } = useWebApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!webApp) return;

    const isHome = pathname === "/";

    const onBack = () => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    };

    if (isHome) {
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
