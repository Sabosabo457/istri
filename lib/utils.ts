export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 800; 
        let w = img.width, h = img.height;
        if (w > h && w > MAX_SIZE) { h = (h * MAX_SIZE) / w; w = MAX_SIZE; }
        else if (h > MAX_SIZE) { w = (w * MAX_SIZE) / h; h = MAX_SIZE; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.7); 
      };
    };
  });
}

export const formatElapsed = (timestamp: any) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000); 
  if (diff < 1) return "1分未満";
  if (diff < 60) return `${diff}分`;
  return `${Math.floor(diff/60)}時間 ${diff%60}分`;
}
