"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createGroup } from "@/app/actions/groups";
import { actionErrorHint } from "@/lib/errors/user-hint";

const schema = z.object({
  name: z.string().min(1, "Введите название группы").max(120),
  participants: z
    .array(z.object({ displayName: z.string().min(1, "Введите имя").max(80) }))
    .min(2, "Добавьте хотя бы одного участника"),
});

type FormValues = z.infer<typeof schema>;

export function CreateGroupForm() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      participants: [{ displayName: "" }, { displayName: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants",
  });

  async function onSubmit(values: FormValues) {
    const result = await createGroup(values);

    if (!result.ok) {
      toast.error(actionErrorHint(result.error.code, result.error.message));
      return;
    }

    router.push(`/groups/${result.groupId}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Group name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-[0.875rem] font-medium">
          Название группы
        </Label>
        <Input
          id="name"
          placeholder="Например, Поездка в Сочи"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-[0.8125rem] text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Currency (locked) */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[0.875rem] font-medium">Валюта</Label>
        <Input value="RUB" disabled className="opacity-60 cursor-not-allowed" />
      </div>

      <Separator />

      {/* Participants */}
      <div className="flex flex-col gap-3">
        <p className="text-[0.875rem] font-medium">Участники</p>

        {fields.map((field, index) => {
          const isOwner = index === 0;
          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[0.875rem] font-medium">
                  {isOwner ? "Вы" : `Участник ${index}`}
                </Label>
                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-destructive hover:opacity-70 transition-opacity"
                    aria-label="Удалить участника"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <Input
                placeholder={isOwner ? "Ваше имя" : "Имя участника"}
                {...register(`participants.${index}.displayName`)}
                aria-invalid={!!errors.participants?.[index]?.displayName}
              />
              {errors.participants?.[index]?.displayName && (
                <p className="text-[0.8125rem] text-destructive">
                  {errors.participants[index].displayName?.message}
                </p>
              )}
            </div>
          );
        })}

        {errors.participants?.root && (
          <p className="text-[0.8125rem] text-destructive">
            {errors.participants.root.message}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start gap-1.5"
          onClick={() => append({ displayName: "" })}
        >
          <Plus className="size-4" />
          Добавить участника
        </Button>
      </div>

      <Separator />

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Создаём..." : "Создать группу"}
      </Button>
    </form>
  );
}
