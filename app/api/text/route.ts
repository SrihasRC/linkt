import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

// Generate a random 6-character code
function generateShareCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { text, language } = data;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: "No text content received" }, { status: 400 });
    }

    // Validate text length (1MB limit)
    if (text.length > 1024 * 1024) {
      return NextResponse.json({ error: "Text too long (max 1MB)" }, { status: 400 });
    }

    // Generate share code
    const shareCode = generateShareCode();
    const fileName = `${shareCode}.txt`;
    
    // Create text file with metadata
    const textData = {
      content: text,
      language: language || 'text',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads");
    
    try {
      await writeFile(join(uploadsDir, fileName), JSON.stringify(textData, null, 2));
    } catch (error) {
      // If uploads directory doesn't exist, create it
      const { mkdir } = await import("fs/promises");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(join(uploadsDir, fileName), JSON.stringify(textData, null, 2));
    }

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Return success response with share code
    return NextResponse.json({
      success: true,
      shareCode,
      textLength: text.length,
      language: language || 'text',
      expiresAt: expiresAt.toISOString(),
      accessUrl: `/t/${shareCode}`
    });

  } catch (error) {
    console.error("Text upload error:", error);
    return NextResponse.json(
      { error: "Failed to save text" },
      { status: 500 }
    );
  }
}
