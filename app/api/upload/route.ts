import { NextResponse } from "next/server";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const inputPath = formData.get("path") as string;

    if (!file || !inputPath) throw new Error("Missing file or path");

    // 【対策】ファイルサイズを5MBに制限
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // 【対策】保存先を制限し、不正な書き込み（..）を禁止
    const safePath = "uploads/" + inputPath.replace(/\.\.\//g, "").replace(/^\//, "");

    const storageRef = ref(storage, safePath);
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await uploadBytes(storageRef, uint8Array, {
      contentType: file.type || "image/jpeg"
    });

    const url = await getDownloadURL(storageRef);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("API Upload Error detail:", error.code, error.message);
    return NextResponse.json({
      error: error.message || "Unknown server error",
      code: error.code || "unknown"
    }, { status: 500 });
  }
}
