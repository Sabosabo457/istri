import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathParam = searchParams.get("path");
    
    if (!pathParam) return new NextResponse("Missing path", { status: 400 });

    // 危険な文字（..）を排除し、publicフォルダ内のみ許可する
    const safePath = pathParam.replace(/\.\.\//g, "");
    const filePath = path.join(process.cwd(), "public", safePath);

    if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return new NextResponse("Error", { status: 500 });
  }
}
