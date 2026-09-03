import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const update = await req.json();

    if (!update.callback_query) {
      return NextResponse.json({ status: "ignored" });
    }

    const { id: callbackQueryId, data, message } = update.callback_query;
    const chatId = message.chat.id;
    const messageId = message.message_id;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const vercelToken = process.env.VERCEL_TOKEN;

    const [action, workspaceId] = data.split(":");

    if (action === "grant_24h") {
      // 1. Acknowledge button click in Telegram
      await answerCallback(botToken!, callbackQueryId, "Granted +24h Extension!");

      // 2. Edit Telegram message to reflect approval
      await editTelegramMessage(
        botToken!,
        chatId,
        messageId,
        `${message.text}\n\n✅ *STATUS: APPROVED (+24 Hours Granted)*`
      );
    } else if (action === "decline_delete") {
      await answerCallback(botToken!, callbackQueryId, "Deleting Vercel Project...");

      // 3. Delete Project from Vercel via REST API
      let vercelStatus = "Project Deleted from Vercel";
      if (vercelToken) {
        const vercelRes = await fetch(`https://api.vercel.com/v9/projects/${workspaceId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        });

        if (!vercelRes.ok) {
          vercelStatus = `Vercel deletion error (${vercelRes.status})`;
        }
      }

      // 4. Update Telegram message to reflect termination
      await editTelegramMessage(
        botToken!,
        chatId,
        messageId,
        `${message.text}\n\n❌ *STATUS: DECLINED (${vercelStatus})*`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function answerCallback(token: string, callbackId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  });
}

async function editTelegramMessage(token: string, chatId: number, messageId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "Markdown",
    }),
  });
}