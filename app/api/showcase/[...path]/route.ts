import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime-types";

// Fetch active target domain directly from Vercel API
async function getVercelProjectDomain(projectId: string, vercelToken: string): Promise<string> {
  try {
    const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!res.ok) return "";
    const data = await res.json();
    const primaryDomain = data.targets?.production?.domain || data.domains?.[0]?.name;
    return primaryDomain ? `https://${primaryDomain}` : "";
  } catch (err) {
    console.error("Error fetching Vercel project domain:", err);
    return "";
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;

  // Security: Prevent directory traversal
  const safePath = path.normalize((pathSegments || []).join("/")).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(process.cwd(), "showcase", safePath);

  let targetPath = filePath;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    targetPath = path.join(filePath, "index.html");
  }

  // Fallback to dynamic Vercel API domain lookup if local static showcase folder doesn't exist
  if (!fs.existsSync(targetPath)) {
    const slug = pathSegments?.[0];
    if (slug) {
      const vercelToken = process.env.VERCEL_TOKEN;
      if (vercelToken) {
        const projectId = `demo-${slug}`;
        const projectDomain = await getVercelProjectDomain(projectId, vercelToken);
        if (projectDomain) {
          return NextResponse.json({ deployedUrl: projectDomain });
        }
      }
      // Hardcoded fallback if token query yields nothing
      return NextResponse.json({ deployedUrl: `https://demo-${slug}.vercel.app` });
    }
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

  // Safely set CSP frame-ancestors when embedded from main domain
  const referrer = req.headers.get("referer") || "";
  if (referrer.includes("chemitha.com")) {
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://chemitha.com https://*.chemitha.com"
    );
  }

  return response;
}