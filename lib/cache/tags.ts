/** Теги для revalidateTag — держим в одном месте */

export const GROUP_DATA_TAG_PREFIX = "group-data:";

export function groupDataTag(groupId: string): string {
  return `${GROUP_DATA_TAG_PREFIX}${groupId}`;
}

export function userGroupsTag(userId: string): string {
  return `user-groups:${userId}`;
}
