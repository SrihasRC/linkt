import { NextRequest, NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    // Simple authentication check (you could make this more secure)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer cleanup-secret-key') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploadsDir = join(process.cwd(), "uploads");
    let deletedFiles = 0;
    let totalFiles = 0;

    try {
      const files = await readdir(uploadsDir);
      totalFiles = files.length;

      for (const file of files) {
        const filePath = join(uploadsDir, file);
        
        try {
          const fileStats = await stat(filePath);
          const fileAge = Date.now() - fileStats.mtime.getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          // Delete files older than 24 hours
          if (fileAge > maxAge) {
            await unlink(filePath);
            deletedFiles++;
          }
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
          // Continue with next file
        }
      }
    } catch (error) {
      // Directory might not exist yet
      console.log("Uploads directory doesn't exist yet");
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Deleted ${deletedFiles} of ${totalFiles} files.`,
      deletedFiles,
      totalFiles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to run cleanup" },
      { status: 500 }
    );
  }
}
