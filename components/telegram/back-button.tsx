"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWebApp } from "./web-app-provider";

const START_ROUTE = "/";

export function TelegramBackButton() {
  const { webApp } = useWebApp();
  const pathname = usePathname();

  useEffect(() => {
    if (!webApp) return;

    const onBack = () => history.back();
    const isStart = pathname === START_ROUTE;

    if (isStart) {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(onBack);
    } else {
      webApp.BackButton.show();
      webApp.BackButton.onClick(onBack);
    }

    return () => {
      webApp.BackButton.offClick(onBack);
    };
  }, [webApp, pathname]);

  return null;
}
