import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { Stats } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Invalid share code" }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), "uploads");
    
    // Find file with this code (check different extensions)
    const extensions = ['.jpg', '.png', '.gif', '.webp', '.txt', '.pdf', '.json', '.js', '.ts', '.css', '.html', '.bin'];
    let filePath: string | null = null;
    let fileStats: Stats | null = null;

    for (const ext of extensions) {
      const testPath = join(uploadsDir, `${code}${ext}`);
      try {
        fileStats = await stat(testPath);
        filePath = testPath;
        break;
      } catch {
        // File doesn't exist with this extension, continue
        continue;
      }
    }

    if (!filePath || !fileStats) {
      return NextResponse.json({ error: "File not found or expired" }, { status: 404 });
    }

    // Check if file has expired (24 hours)
    const fileAge = Date.now() - fileStats.mtime.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (fileAge > maxAge) {
      return NextResponse.json({ error: "File has expired" }, { status: 410 });
    }

    // Read and return the file
    const fileBuffer = await readFile(filePath);
    const fileName = filePath.split('/').pop() || 'download';
    
    // Determine content type based on extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'pdf': 'application/pdf',
      'json': 'application/json',
      'js': 'text/javascript',
      'ts': 'text/typescript',
      'css': 'text/css',
      'html': 'text/html',
    };
    
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
