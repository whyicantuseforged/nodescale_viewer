import { NextResponse } from "next/server";
import { extractCafe24WebhookOrderId, syncCafe24Order } from "@/lib/cafe24";

function isWebhookAuthorized(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.CAFE24_WEBHOOK_SECRET ?? process.env.CAFE24_SYNC_SECRET;

  if (!expected) {
    return false;
  }

  return secret === expected;
}

export async function POST(request: Request) {
  if (!isWebhookAuthorized(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const orderId = extractCafe24WebhookOrderId(payload);

  if (!orderId) {
    return NextResponse.json(
      { accepted: true, message: "Webhook received but no order_id was found" },
      { status: 202 },
    );
  }

  try {
    const result = await syncCafe24Order(orderId);
    return NextResponse.json({
      accepted: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        accepted: false,
        message: error instanceof Error ? error.message : "Unexpected webhook sync error",
      },
      { status: 500 },
    );
  }
}
