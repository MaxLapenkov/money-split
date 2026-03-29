import { revalidatePath, revalidateTag } from "next/cache";
import { groupDataTag, userGroupsTag } from "./tags";

/**
 * Сбрасывает кэш данных группы и связанные маршруты (после траты, settlement, binding, view).
 */
export function revalidateGroupData(groupId: string): void {
  revalidateTag(groupDataTag(groupId), "minutes");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/expenses`);
  revalidatePath(`/groups/${groupId}/expenses/new`);
  revalidatePath(`/groups/${groupId}/repayments`);
}

/** Список групп на главной после создания группы / привязки */
export function revalidateUserGroupsList(userId: string): void {
  revalidateTag(userGroupsTag(userId), "minutes");
  revalidatePath("/");
}

/** Только сброс unstable_cache по группе (без revalidatePath), например после upsert в RSC */
export function revalidateGroupDataCache(groupId: string): void {
  revalidateTag(groupDataTag(groupId), "minutes");
}
