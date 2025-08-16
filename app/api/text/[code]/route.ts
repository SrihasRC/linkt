import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { Stats } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Invalid share code" }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), "uploads");
    const filePath = join(uploadsDir, `${code}.txt`);

    let fileStats: Stats;
    try {
      fileStats = await stat(filePath);
    } catch {
      return NextResponse.json({ error: "Text not found or expired" }, { status: 404 });
    }

    // Check if file has expired (24 hours)
    const fileAge = Date.now() - fileStats.mtime.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (fileAge > maxAge) {
      return NextResponse.json({ error: "Text has expired" }, { status: 410 });
    }

    // Read and parse the text data
    const fileContent = await readFile(filePath, 'utf-8');
    const textData = JSON.parse(fileContent);

    // Return the text data
    return NextResponse.json({
      success: true,
      content: textData.content,
      language: textData.language || 'text',
      createdAt: textData.createdAt,
      expiresAt: textData.expiresAt
    });

  } catch (error) {
    console.error("Text access error:", error);
    return NextResponse.json(
      { error: "Failed to access text" },
      { status: 500 }
    );
  }
}
