"use client";

import { useWebApp } from "@/components/telegram/web-app-provider";
import { Button } from "@/components/ui/button";

const SUPPORT_URL = "https://boosty.to/maxlapenkov/donate";

export function SupportButton() {
  const { webApp } = useWebApp();

  function handleClick() {
    webApp?.HapticFeedback?.impactOccurred("light");
    if (webApp) {
      webApp.openLink(SUPPORT_URL);
    } else {
      window.open(SUPPORT_URL, "_blank");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-xl py-6 text-[0.9375rem] font-semibold"
      onClick={handleClick}
    >
      ❤️ Поддержать
    </Button>
  );
}
