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

  const response = new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "X-Frame-Options": "SAMEORIGIN",
    },
  });

  // Safely set CSP ONLY if embedding is intended
  const referrer = req.headers.get("referer") || "";
  if (referrer.includes("chemitha.com")) {
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://chemitha.com https://*.chemitha.com"
    );
  }

  return response;
}
