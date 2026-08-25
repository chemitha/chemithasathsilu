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
      // Fetch assigned domains directly for project "demo-[slug]"
      const res = await fetch(
        `https://api.vercel.com/v9/projects/demo-${slug}/domains`,
        {
          headers: { Authorization: `Bearer ${vercelToken}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Get the main production domain (e.g., demo-linear.vercel.app)
        const cleanDomain = data.domains?.[0]?.name;

        if (cleanDomain) {
          return NextResponse.json({
            deployedUrl: `https://${cleanDomain}`,
          });
        }
      }
    } catch (err) {
      console.error("Vercel domain fetch error:", err);
    }
  }

  // Fallback pattern if API fails
  return NextResponse.json({
    deployedUrl: `https://demo-${slug}.vercel.app`,
  });
}