import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRoute } from "@/lib/admin";
import { createCafe24AuthorizationUrl } from "@/lib/cafe24";

const STATE_COOKIE_NAME = "cafe24_oauth_state";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin/integrations";
  }

  return value;
}

function encodeState(nextPath: string) {
  return Buffer.from(
    JSON.stringify({
      nextPath,
      nonce: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }),
  ).toString("base64url");
}

export async function GET(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const state = encodeState(nextPath);
  const response = NextResponse.redirect(createCafe24AuthorizationUrl(state));

  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
