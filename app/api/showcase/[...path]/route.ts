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

  let deployedUrl = `https://demo-${slug}.vercel.app`;

  // 1. Fetch live target domain directly from Vercel API
  const vercelToken = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (vercelToken) {
    try {
      const url = new URL(`https://api.vercel.com/v9/projects/demo-${slug}/domains`);
      if (teamId) {
        url.searchParams.append("teamId", teamId);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const primaryDomain = data.domains?.[0]?.name;

        if (primaryDomain) {
          deployedUrl = `https://${primaryDomain}`;
        }
      }
    } catch (err) {
      console.error("[Showcase API] Domain fetch error:", err);
    }
  }

  // 2. Dispatch telemetry to Express engine
  const trackerUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:3001";

  try {
    await fetch(`${trackerUrl}/api/track-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "bypass-tunnel-reminder": "true",
      },
      body: JSON.stringify({ slug, deployedUrl }),
    });
  } catch (err) {
    console.error("[Showcase API] Telemetry dispatch error:", err);
  }

  return NextResponse.json({ deployedUrl });
}