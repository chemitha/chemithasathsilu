import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { workspaceId, selectedReasons, customReason } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Missing Telegram config" }, { status: 500 });
    }

    const message = 
      `⚠️ *EXTENSION REQUEST RECEIVED*\n\n` +
      `*Workspace ID:* \`${workspaceId}\`\n` +
      `*Reasons Selected:*\n${selectedReasons.map((r: string) => `• ${r}`).join("\n") || "None"}\n` +
      (customReason ? `*Custom Note:* ${customReason}\n` : "");

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Grant +24h", callback_data: `grant_24h:${workspaceId}` },
              { text: "🗑️ Decline & Delete", callback_data: `decline_delete:${workspaceId}` },
            ],
          ],
        },
      }),
    });

    if (!res.ok) throw new Error("Failed to post message to Telegram");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}