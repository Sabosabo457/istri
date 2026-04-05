// app/(shared)/types.ts
import { FieldValue } from "firebase/firestore";

// カラーパレットの定義（プロフィールの色選択用）
export const COLORS = [
  "#f97316", "#ef4444", "#ec4899", "#8b5cf6", 
  "#3b82f6", "#06b6d4", "#10b981", "#84cc16",
  "#eab308", "#78350f", "#44403c", "#1c1917"
];

export type Member = {
  id: string;
  name: string;
  color: string;
  photoURL?: string | null;
  status?: string;
  statusUpdatedAt?: any; // ★ これを追加
  lastActive?: any;
};

export type Message = {
  id?: string;
  text: string;
  imageUrl?: string | null;
  senderId: string;
  senderName: string;
  createdAt: any;
  isOptimistic?: boolean;
};

export type DayLog = {
  users: Record<string, {
    duration?: string;
    note?: string;
    lastUpdate?: any;
  }>;
};