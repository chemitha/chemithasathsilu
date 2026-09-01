import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Regex to intercept crawler/preview user agents
const BOT_REGEX = /bot|spider|crawl|slurp|facebookexternalhit|telegrambot|twitterbot|whatsapp|linkedinbot|discordbot|curl|wget|python-requests/i;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const slug = pathSegments?.[0]?.toLowerCase();

  if (!slug) {
    return new NextResponse("Showcase slug is required", { status: 400 });
  }

  // Define base main app fallback to avoid pointing to dead demo-*.vercel.app subdomains
  const baseAppUrl = process.env.NEXT_PUBLIC_BASE_APP_URL || "https://your-main-app.vercel.app";
  let deployedUrl: string | null = null;

  // 1. Primary Lookup: Try fetching actual target URL from your Express backend / DB
  const trackerUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:3001";
  
  try {
    const leadRes = await fetch(`${trackerUrl}/api/leads/${slug}`, {
      headers: { "bypass-tunnel-reminder": "true" },
      cache: "no-store",
    });
    
    if (leadRes.ok) {
      const leadData = await leadRes.json();
      if (leadData?.deployedUrl) {
        deployedUrl = leadData.deployedUrl;
      }
    }
  } catch (err) {
    console.error("[Showcase API] Database lead lookup error:", err);
  }

  // 2. Secondary Lookup: Try Vercel API if project exists under specific domain format
  if (!deployedUrl) {
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
        console.error("[Showcase API] Vercel domain fetch error:", err);
      }
    }
  }

  // 3. Absolute Fallback: Append slug as query parameter to primary app to preserve context
  if (!deployedUrl) {
    deployedUrl = `${baseAppUrl}?showcase=${slug}`;
  }

  // 4. Bot Detection Guard
  const userAgent = req.headers.get("user-agent") || "";
  if (BOT_REGEX.test(userAgent)) {
    console.log(`[Showcase API] Ignored bot request for "${slug}" (${userAgent})`);
    return NextResponse.json({ deployedUrl, tracked: false });
  }

  // 5. Dispatch Telemetry
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  try {
    await fetch(`${trackerUrl}/api/track-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "bypass-tunnel-reminder": "true",
      },
      body: JSON.stringify({ slug, deployedUrl, clientIp }),
    });
  } catch (err) {
    console.error("[Showcase API] Telemetry dispatch error:", err);
  }

  return NextResponse.json({ deployedUrl, tracked: true });
}