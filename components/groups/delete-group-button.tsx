"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWebApp } from "@/components/telegram/web-app-provider";
import { deleteGroup } from "@/app/actions/groups";

type Props = {
  groupId: string;
  groupName: string;
};

export function DeleteGroupButton({ groupId, groupName }: Props) {
  const { webApp } = useWebApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const result = await deleteGroup(groupId);
      if (result && "ok" in result && result.ok === false) {
        toast.error(
          result.error.code === "FORBIDDEN"
            ? result.error.message
            : "Не удалось удалить группу",
        );
        return;
      }
      webApp?.HapticFeedback.notificationOccurred("success");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        Удалить группу
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={!loading}>
          <DialogHeader>
            <DialogTitle>Удалить группу?</DialogTitle>
            <DialogDescription>
              Группа «{groupName}» будет удалена безвозвратно. Все траты,
              расчёты и приглашения этой группы будут потеряны. Это действие
              нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading ? "Удаление..." : "Удалить навсегда"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
