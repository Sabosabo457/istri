export type Member = { 
  name: string; 
  status: "作業中" | "休憩中"; 
  color: string; 
  photoURL?: string; 
  statusUpdatedAt?: any; 
};

export type Message = { 
  id: string; 
  text?: string | null; 
  imageUrl?: string | null; 
  senderId: string; 
  senderName: string; 
  createdAt: any; 
  isOptimistic?: boolean; 
};

export type DayLog = { 
  date: string; 
  users: { [uid: string]: { name: string; duration: string; photoURL?: string; note?: string } }; 
  note?: string; 
};

export const COLORS = ["#f97316", "#ec4899", "#f59e0b", "#10b981", "#ffc107", "#ef4444"];
