import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

// Generate a random 6-character code
function generateShareCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

// Get file extension from MIME type
function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'text/plain': '.txt',
    'application/pdf': '.pdf',
    'application/json': '.json',
    'text/javascript': '.js',
    'text/typescript': '.ts',
    'text/css': '.css',
    'text/html': '.html',
  };
  return extensions[mimeType] || '.bin';
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
    }

    // Generate share code and file info
    const shareCode = generateShareCode();
    const fileExtension = getFileExtension(file.type);
    const fileName = `${shareCode}${fileExtension}`;
    
    // Convert file to bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads");
    
    try {
      await writeFile(join(uploadsDir, fileName), buffer);
    } catch {
      // If uploads directory doesn't exist, create it
      const { mkdir } = await import("fs/promises");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(join(uploadsDir, fileName), buffer);
    }

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Return success response with share code
    return NextResponse.json({
      success: true,
      shareCode,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      expiresAt: expiresAt.toISOString(),
      downloadUrl: `/api/download/${shareCode}`
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
