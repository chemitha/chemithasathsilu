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

  // 2. Direct Telegram Notification (No Database Required)
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminId = process.env.ADMIN_TELEGRAM_CHAT_ID;

  if (botToken && adminId) {
    const rawCompany = slug.split("-")[0].toUpperCase();

    const message =
      `🎯 <b>Hot Lead Alert! Showcase Opened</b>\n\n` +
      `• <b>Company (Slug):</b> <code>${rawCompany}</code> (${slug})\n` +
      `• <b>Target Demo:</b> ${deployedUrl}\n` +
      `• <b>Opened At:</b> ${new Date().toLocaleTimeString()}`;

    // Non-blocking background fetch
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminId,
        text: message,
        parse_mode: "HTML",
      }),
    }).catch((err) => console.error("[Showcase API] Telegram alert error:", err));
  }

  return NextResponse.json({ deployedUrl });
}