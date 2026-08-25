import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const slug = pathSegments?.[0]?.toLowerCase();

  console.log(`\n=================== [SHOWCASE ROUTE START] ===================`);
  console.log(`[Showcase API] Incoming request for slug: "${slug}"`);

  if (!slug) {
    console.log(`[Showcase API] ❌ ERROR: Showcase slug is missing in params.`);
    return new NextResponse("Showcase slug is required", { status: 400 });
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  console.log(`[Showcase API] ENV Check -> VERCEL_TOKEN: ${vercelToken ? "EXISTS (Length: " + vercelToken.length + ")" : "❌ MISSING"}`);
  console.log(`[Showcase API] ENV Check -> VERCEL_TEAM_ID: ${teamId || "NOT SET (Personal Account Mode)"}`);

  if (vercelToken) {
    try {
      const url = new URL(`https://api.vercel.com/v6/deployments`);
      url.searchParams.append("projectId", `demo-${slug}`);
      url.searchParams.append("limit", "1");
      if (teamId) {
        url.searchParams.append("teamId", teamId);
      }

      console.log(`[Showcase API] Fetching Vercel API: ${url.toString()}`);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      console.log(`[Showcase API] Vercel API HTTP Status: ${res.status} ${res.statusText}`);

      if (res.ok) {
        const data = await res.json();
        const latestDeployment = data.deployments?.[0];
        const latestBuildUrl = latestDeployment?.url;

        console.log(`[Showcase API] Vercel Deployments Found: ${data.deployments?.length || 0}`);
        console.log(`[Showcase API] Raw Deployment Data:`, latestDeployment ? {
          id: latestDeployment.uid,
          name: latestDeployment.name,
          url: latestDeployment.url,
          state: latestDeployment.state,
        } : "NONE");

        if (latestBuildUrl) {
          console.log(`[Showcase API] ✅ SUCCESS: Resolved dynamic URL -> https://${latestBuildUrl}`);
          console.log(`=================== [SHOWCASE ROUTE END] ===================\n`);
          return NextResponse.json({
            deployedUrl: `https://${latestBuildUrl}`,
          });
        } else {
          console.log(`[Showcase API] ⚠️ WARNING: API returned 200 OK but deployments array was empty.`);
        }
      } else {
        const errorText = await res.text();
        console.log(`[Showcase API] ❌ VERCEL API ERROR RESPONSE: ${errorText}`);
      }
    } catch (err) {
      console.error("[Showcase API] 💥 FETCH EXCEPTION:", err);
    }
  } else {
    console.log(`[Showcase API] ⚠️ VERCEL_TOKEN missing in environment variables. Skipping Vercel API fetch.`);
  }

  // Fallback route
  const fallbackUrl = `https://demo-${slug}.vercel.app`;
  console.log(`[Showcase API] 🔄 FALLBACK TRIGGERED -> Returning: ${fallbackUrl}`);
  console.log(`=================== [SHOWCASE ROUTE END] ===================\n`);

  return NextResponse.json({
    deployedUrl: fallbackUrl,
  });
}