export type GroupMemberRole = "owner" | "member";
export type ExpenseType = "expense" | "income";
export type SettlementStatus = "suggested" | "paid";
export type GroupViewStatus = "viewed" | "acknowledged";

export interface DbUser {
  id: string;
  telegram_id: string;
  username: string | null;
  display_name: string;
  created_at: string;
}

export interface DbGroup {
  id: string;
  name: string;
  created_by: string;
  currency: string;
  created_at: string;
}

export interface DbGroupMember {
  id: string;
  group_id: string;
  display_name: string;
  role: GroupMemberRole;
  created_at: string;
}

export interface DbInviteToken {
  id: string;
  group_id: string;
  token: string;
  created_by: string;
  created_at: string;
}

export interface DbGroupParticipantBinding {
  id: string;
  group_id: string;
  group_member_id: string;
  user_id: string;
  created_at: string;
}

export interface DbExpense {
  id: string;
  group_id: string;
  type: ExpenseType;
  group_member_id: string;
  note: string;
  amount_minor: number;
  currency: string;
  expense_date: string;
  created_by_user_id: string;
  created_at: string;
}

export interface DbExpenseSplit {
  id: string;
  expense_id: string;
  group_member_id: string;
  amount_minor: number;
}

export interface DbSettlement {
  id: string;
  group_id: string;
  from_group_member_id: string;
  to_group_member_id: string;
  amount_minor: number;
  status: SettlementStatus;
  created_at: string;
  paid_at: string | null;
}

export interface DbGroupViewEvent {
  id: string;
  group_id: string;
  user_id: string;
  group_member_id: string | null;
  status: GroupViewStatus;
  viewed_at: string;
  acknowledged_at: string | null;
  last_seen_expense_id: string | null;
  updated_at: string;
}
