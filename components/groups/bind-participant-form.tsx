"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWebApp } from "@/components/telegram/web-app-provider";
import { bindParticipant } from "@/app/actions/invite";
import { DeleteGroupButton } from "@/components/groups/delete-group-button";
import type { DbGroupMember } from "@/lib/supabase/types";

interface BindParticipantFormProps {
  groupId: string;
  groupName: string;
  members: DbGroupMember[];
  isOwner: boolean;
}

export function BindParticipantForm({
  groupId,
  groupName,
  members,
  isOwner,
}: BindParticipantFormProps) {
  const router = useRouter();
  const { webApp } = useWebApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bindableMembers = members.filter((m) => m.role !== "owner");

  async function handleBind() {
    if (!selected) return;
    setLoading(true);

    try {
      const result = await bindParticipant(groupId, {
        groupMemberId: selected,
      });

      if (!result.ok) {
        if (result.error.code === "BINDING_CONFLICT") {
          toast.error("Этот участник уже занят другим пользователем");
        } else {
          toast.error("Не удалось выбрать участника. Попробуйте ещё раз.");
        }
        return;
      }

      webApp?.HapticFeedback.impactOccurred("medium");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-4 mx-auto w-full max-w-[640px]">
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold">Кто вы в группе?</h1>
        <p className="text-[0.9375rem] text-muted-foreground">
          Выберите своё имя среди участников группы «{groupName}».
        </p>
      </div>

      {bindableMembers.length === 0 ? (
        <p className="text-[0.9375rem] text-muted-foreground text-center py-4">
          В группе пока только организатор. Попросите создателя добавить вас как
          участника в настройках группы.
        </p>
      ) : (
      <div className="flex flex-col gap-2">
        {bindableMembers.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => setSelected(member.id)}
            className={[
              "flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors",
              selected === member.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
            ].join(" ")}
          >
            <span className="text-[0.9375rem]">{member.display_name}</span>
            {selected === member.id && (
              <span className="text-[0.8125rem] text-primary font-medium">
                Выбрано
              </span>
            )}
          </button>
        ))}
      </div>
      )}

      <Button
        onClick={handleBind}
        disabled={!selected || loading || bindableMembers.length === 0}
        className="w-full"
        size="lg"
      >
        {loading ? "Сохраняем..." : "Это я"}
      </Button>

      {isOwner && (
        <DeleteGroupButton groupId={groupId} groupName={groupName} />
      )}
    </div>
  );
}
