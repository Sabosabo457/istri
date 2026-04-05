export const formatElapsed = (timestamp: any) => {
  if (!timestamp) return "";
  
  let date: Date;
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    const d = timestamp.toDate();
    date = d instanceof Date ? d : new Date(d);
  } else if (timestamp.seconds !== undefined) {
    // Firestore Timestamp がシリアライズされたオブジェクト（メソッドなし）の場合
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) return "";

  const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000); 
  if (diff < 1) return "1分未満";
  if (diff < 60) return `${diff}分`;
  return `${Math.floor(diff/60)}時間 ${diff%60}分`;
}
