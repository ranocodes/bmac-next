import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "images");
  try {
    const files = fs.readdirSync(dir);
    const images = files
      .filter((f) => /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(f))
      .map((f) => `/images/${f}`)
      .sort();
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
