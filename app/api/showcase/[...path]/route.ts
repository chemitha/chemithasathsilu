import { NextRequest, NextResponse } from "next/server";

// Fetch active production domain dynamically via Vercel API
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
  const slug = pathSegments?.[0]?.toLowerCase();

  if (!slug) {
    return new NextResponse("Showcase slug is required", { status: 400 });
  }

  // 1. Live resolution via Vercel API if token exists
  const vercelToken = process.env.VERCEL_TOKEN;
  if (vercelToken) {
    const projectId = `demo-${slug}`;
    const projectDomain = await getVercelProjectDomain(projectId, vercelToken);
    if (projectDomain) {
      return NextResponse.json({ deployedUrl: projectDomain });
    }
  }

  // 2. Fallback to standard production URL pattern
  return NextResponse.json({ deployedUrl: `https://demo-${slug}.vercel.app` });
}