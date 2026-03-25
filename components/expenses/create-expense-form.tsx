"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { AmountInput } from "@/components/ui/amount-input";
import { createExpense } from "@/app/actions/expenses";
import type { DbGroupMember } from "@/lib/supabase/types";

const schema = z.object({
  type: z.literal("expense"),
  groupMemberId: z.string().uuid("Выберите участника"),
  splitBetween: z
    .array(z.string().uuid())
    .min(1, "Выберите хотя бы одного участника"),
  note: z.string().min(1, "Введите описание").max(500),
  amount: z.coerce
    .number({ error: "Введите сумму" })
    .positive("Сумма должна быть больше 0"),
  currency: z.literal("RUB"),
  expenseDate: z.string().min(1, "Укажите дату"),
});

type FormValues = z.infer<typeof schema>;

interface CreateExpenseFormProps {
  groupId: string;
  members: DbGroupMember[];
  myMemberId: string | null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function CreateExpenseForm({
  groupId,
  members,
  myMemberId,
}: CreateExpenseFormProps) {
  const allMemberIds = members.map((m) => m.id);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    mode: "onChange",
    defaultValues: {
      type: "expense",
      groupMemberId: myMemberId ?? "",
      splitBetween: allMemberIds,
      note: "",
      amount: undefined,
      currency: "RUB",
      expenseDate: todayIso(),
    },
  });

  function toggleSplit(memberId: string, current: string[]) {
    if (current.includes(memberId)) {
      return current.filter((id) => id !== memberId);
    }
    return [...current, memberId];
  }

  async function onSubmit(values: FormValues) {
    const result = await createExpense(groupId, values);

    if (!result.ok) {
      toast.error(
        result.error.code === "UNAUTHORIZED"
          ? "Необходима авторизация"
          : "Не удалось создать запись. Попробуйте ещё раз.",
      );
      return;
    }

    toast.success("Запись успешно создана", { duration: 500 });
    reset({
      type: "expense",
      groupMemberId: myMemberId ?? "",
      splitBetween: allMemberIds,
      note: "",
      amount: undefined,
      currency: "RUB",
      expenseDate: todayIso(),
    });
  }

  if (members.length === 0) {
    return (
      <p className="text-[0.9375rem] text-muted-foreground py-4 text-center">
        В группе нет участников. Добавьте участников, чтобы записывать траты.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Участник */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[0.875rem] font-medium">Кто платил?</Label>
        <Controller
          control={control}
          name="groupMemberId"
          render={({ field }) => {
            const displayName = members.find(
              (m) => m.id === field.value,
            )?.display_name;
            return (
              <Select
                value={field.value}
                onValueChange={(val) => {
                  if (val === null) return;
                  field.onChange(val);
                }}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={!!errors.groupMemberId}
                >
                  <SelectValue placeholder="Выберите участника">
                    {displayName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-[--radix-select-trigger-width]">
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.groupMemberId && (
          <p className="text-[0.8125rem] text-destructive">
            {errors.groupMemberId.message}
          </p>
        )}
      </div>

      {/* Между кем делим */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[0.875rem] font-medium">Между кем делим?</Label>
        <Controller
          control={control}
          name="splitBetween"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {members.map((m) => {
                const checked = field.value.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      field.onChange(toggleSplit(m.id, field.value))
                    }
                    className={[
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                      checked
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "size-4 rounded border-2 flex items-center justify-center shrink-0",
                        checked
                          ? "border-primary bg-primary"
                          : "border-muted-foreground",
                      ].join(" ")}
                    >
                      {checked && (
                        <svg
                          viewBox="0 0 10 8"
                          fill="none"
                          className="size-2.5"
                        >
                          <path
                            d="M1 4l2.5 2.5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary-foreground"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-[0.9375rem]">{m.display_name}</span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.splitBetween && (
          <p className="text-[0.8125rem] text-destructive">
            {errors.splitBetween.message}
          </p>
        )}
      </div>

      <Separator />

      {/* За что */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note" className="text-[0.875rem] font-medium">
          За что?
        </Label>
        <Input
          id="note"
          placeholder="Например, Пицца"
          {...register("note")}
          aria-invalid={!!errors.note}
        />
        {errors.note && (
          <p className="text-[0.8125rem] text-destructive">
            {errors.note.message}
          </p>
        )}
      </div>

      {/* Сумма */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount" className="text-[0.875rem] font-medium">
          Сумма
        </Label>
        <AmountInput
          id="amount"
          {...register("amount")}
          aria-invalid={!!errors.amount}
        />
        {errors.amount && (
          <p className="text-[0.8125rem] text-destructive">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Дата */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[0.875rem] font-medium">Когда?</Label>
        <Controller
          control={control}
          name="expenseDate"
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              aria-invalid={!!errors.expenseDate}
            />
          )}
        />
        {errors.expenseDate && (
          <p className="text-[0.8125rem] text-destructive">
            {errors.expenseDate.message}
          </p>
        )}
      </div>

      <Separator />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? "Сохраняем..." : "Создать"}
      </Button>
    </form>
  );
}
