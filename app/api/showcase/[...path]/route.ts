import { NextRequest, NextResponse } from "next/server";

// Stop Next.js / Vercel Edge from caching this route response
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const teamId = process.env.VERCEL_TEAM_ID;

  if (vercelToken) {
    try {
      const url = new URL(
        `https://api.vercel.com/v9/projects/demo-${slug}/domains`
      );
      if (teamId) {
        url.searchParams.append("teamId", teamId);
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store", // Prevent fetch caching
      });

      if (res.ok) {
        const data = await res.json();
        const primaryDomain = data.domains?.[0]?.name;

        if (primaryDomain) {
          return NextResponse.json({
            deployedUrl: `https://${primaryDomain}`,
          });
        }
      }
    } catch (err) {
      console.error("Vercel domain fetch error:", err);
    }
  }

  // Fallback if token is unconfigured or domain query returns empty
  return NextResponse.json({
    deployedUrl: `https://demo-${slug}.vercel.app`,
  });
}