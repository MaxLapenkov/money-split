import { unstable_cache } from "next/cache";
import { getBindingForUser } from "@/lib/queries/bindings";
import {
  getExpensesByGroupId,
  getSplitsByGroupId,
} from "@/lib/queries/expenses";
import {
  getGroupById,
  getGroupMembers,
  getGroupsByUserId,
} from "@/lib/queries/groups";
import { getSettlementsByGroupId } from "@/lib/queries/settlements";
import { getViewEventsForGroup } from "@/lib/queries/view-events";
import { groupDataTag, userGroupsTag } from "@/lib/cache/tags";

/** Данные группы (участники, траты, события): до 2 мин в кэше, сброс по тегу */
const GROUP_REVALIDATE_SECONDS = 120;

/** Список групп пользователя на главной: 1 мин */
const USER_GROUPS_REVALIDATE_SECONDS = 60;

export function fetchGroupById(groupId: string) {
  return unstable_cache(
    async () => getGroupById(groupId),
    ["query", "group-by-id", groupId],
    {
      revalidate: GROUP_REVALIDATE_SECONDS,
      tags: [groupDataTag(groupId)],
    },
  )();
}

export function fetchGroupMembers(groupId: string) {
  return unstable_cache(
    async () => getGroupMembers(groupId),
    ["query", "group-members", groupId],
    {
      revalidate: GROUP_REVALIDATE_SECONDS,
      tags: [groupDataTag(groupId)],
    },
  )();
}

export function fetchBindingForUser(groupId: string, userId: string) {
  return unstable_cache(
    async () => getBindingForUser(groupId, userId),
    ["query", "binding", groupId, userId],
    {
      revalidate: GROUP_REVALIDATE_SECONDS,
      tags: [groupDataTag(groupId), userGroupsTag(userId)],
    },
  )();
}

export function fetchExpensesByGroupId(groupId: string) {
  return unstable_cache(
    async () => getExpensesByGroupId(groupId),
    ["query", "expenses", groupId],
    {
      revalidate: GROUP_REVALIDATE_SECONDS,
      tags: [groupDataTag(groupId)],
    },
  )();
}

export function fetchSplitsByGroupId(groupId: string) {
  return unstable_cache(
    async () => getSplitsByGroupId(groupId),
    ["query", "splits", groupId],
    {
      revalidate: GROUP_REVALIDATE_SECONDS,
      tags: [groupDataTag(groupId)],
    },
  )();
}

export function fetchViewEventsForGroup(groupId: string) {
  return unstable_cache(
    async () => getViewEventsForGroup(groupId),
    ["query", "view-events", groupId],
    {
      revalidate: GROUP_REVALIDATE_SECONDS,
      tags: [groupDataTag(groupId)],
    },
  )();
}

export function fetchSettlementsByGroupId(groupId: string) {
  return unstable_cache(
    async () => getSettlementsByGroupId(groupId),
    ["query", "settlements", groupId],
    {
      revalidate: GROUP_REVALIDATE_SECONDS,
      tags: [groupDataTag(groupId)],
    },
  )();
}

export function fetchGroupsForUser(userId: string) {
  return unstable_cache(
    async () => getGroupsByUserId(userId),
    ["query", "user-groups", userId],
    {
      revalidate: USER_GROUPS_REVALIDATE_SECONDS,
      tags: [userGroupsTag(userId)],
    },
  )();
}
