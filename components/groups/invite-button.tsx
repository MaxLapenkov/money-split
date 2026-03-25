"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebApp } from "@/components/telegram/web-app-provider";
import { generateInvite } from "@/app/actions/invite";

interface InviteButtonProps {
  groupId: string;
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "";
const APP_SHORTNAME = process.env.NEXT_PUBLIC_APP_SHORTNAME ?? "";

export function InviteButton({ groupId }: InviteButtonProps) {
  const { webApp } = useWebApp();
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    setLoading(true);
    try {
      const result = await generateInvite(groupId);

      if (!result.ok) {
        toast.error("Не удалось создать ссылку. Попробуйте ещё раз.");
        return;
      }

      const inviteUrl = `https://t.me/${BOT_USERNAME}/${APP_SHORTNAME}?startapp=join_${result.inviteToken}`;

      if (webApp) {
        webApp.openTelegramLink(
          `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent("Присоединяйся к нашей группе в Money Split!")}`,
        );
        webApp.HapticFeedback.impactOccurred("medium");
      } else {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success("Ссылка скопирована в буфер обмена");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleInvite}
      disabled={loading}
    >
      <Share2 className="size-4" />
      {loading ? "Генерируем..." : "Пригласить участников"}
    </Button>
  );
}
