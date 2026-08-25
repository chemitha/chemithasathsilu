import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const slug = pathSegments?.[0]?.toLowerCase();

  if (!slug) {
    return new NextResponse("Showcase slug is required", { status: 400 });
  }

  const vercelToken = process.env.VERCEL_TOKEN;

  if (vercelToken) {
    try {
      // Fetch the single latest deployment build hash for project "demo-[slug]"
      const res = await fetch(
        `https://api.vercel.com/v6/deployments?projectId=demo-${slug}&limit=1`,
        {
          headers: { Authorization: `Bearer ${vercelToken}` },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json();
        const latestBuildUrl = data.deployments?.[0]?.url;

        if (latestBuildUrl) {
          return NextResponse.json({
            deployedUrl: `https://${latestBuildUrl}`,
          });
        }
      }
    } catch (err) {
      console.error("Vercel deployment fetch error:", err);
    }
  }

  return NextResponse.json(
    { error: "Deployment not found" },
    { status: 404 }
  );
}