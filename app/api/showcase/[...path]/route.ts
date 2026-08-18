import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  // Security: Prevent directory traversal
  const safePath = path.normalize(pathSegments.join("/")).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(process.cwd(), "showcase", safePath);

  let targetPath = filePath;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    targetPath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(targetPath)) {
    return new NextResponse("Showcase file not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(targetPath);
  const contentType = mime.lookup(targetPath) || "application/octet-stream";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'",
    },
  });
}
