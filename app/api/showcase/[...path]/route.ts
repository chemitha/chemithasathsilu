import { NextRequest, NextResponse } from "next/server";

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
      // 1. Search Vercel API for projects matching target slug (e.g., "demo-vercel")
      const searchRes = await fetch(
        `https://api.vercel.com/v9/projects?search=demo-${slug}`,
        {
          headers: { Authorization: `Bearer ${vercelToken}` },
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const project = searchData.projects?.[0];

        if (project) {
          // 2. Fetch primary production target domain for matching project
          const domainRes = await fetch(
            `https://api.vercel.com/v9/projects/${project.id}`,
            {
              headers: { Authorization: `Bearer ${vercelToken}` },
            }
          );

          if (domainRes.ok) {
            const domainData = await domainRes.json();
            const targetDomain =
              domainData.targets?.production?.domain ||
              domainData.domains?.[0]?.name;

            if (targetDomain) {
              return NextResponse.json({
                deployedUrl: `https://${targetDomain}`,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Vercel dynamic resolution error:", err);
    }
  }

  // Fallback pattern
  return NextResponse.json({
    deployedUrl: `https://demo-${slug}.vercel.app`,
  });
}