export const COLORS = ["#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#84cc16"];

export interface DayLog {
  users: Record<string, {
    note: string;
    duration?: string;
    lastUpdate: any;
  }>;
}

export interface Member {
  id: string;
  name: string;
  color: string;
  photoURL: string | null;
  status: string;
  statusUpdatedAt: any;
  lastActive: any;
}

export interface Message {
  id: string;
  text: string;
  imageUrl: string | null;
  senderId: string;
  senderName: string;
  createdAt: any;
}

export interface RoomData {
  title: string;
  password?: string | null;
  ownerId?: string;
}
