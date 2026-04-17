import { NextResponse, type NextRequest } from "next/server";
import { requireAdminRoute } from "@/lib/admin";
import { exchangeCafe24AuthorizationCode } from "@/lib/cafe24";

const STATE_COOKIE_NAME = "cafe24_oauth_state";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin/integrations";
  }

  return value;
}

function decodeState(state: string | null) {
  if (!state) {
    return {
      nextPath: "/admin/integrations",
    };
  }

  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
      nextPath?: unknown;
    };

    return {
      nextPath:
        typeof parsed.nextPath === "string"
          ? sanitizeNextPath(parsed.nextPath)
          : "/admin/integrations",
    };
  } catch {
    return {
      nextPath: "/admin/integrations",
    };
  }
}

function createRedirectResponse(
  request: NextRequest,
  nextPath: string,
  status: "success" | "error",
  message?: string,
) {
  const url = new URL(sanitizeNextPath(nextPath), request.url);
  url.searchParams.set("cafe24", status);

  if (message) {
    url.searchParams.set("message", message);
  }

  const response = NextResponse.redirect(url);
  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdminRoute();
  if (!admin.ok) {
    return admin.response;
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE_NAME)?.value ?? null;
  const { nextPath } = decodeState(state ?? cookieState);

  if (!code) {
    return createRedirectResponse(
      request,
      nextPath,
      "error",
      "Cafe24에서 authorization code가 전달되지 않았습니다.",
    );
  }

  if (!state || !cookieState || state !== cookieState) {
    return createRedirectResponse(
      request,
      nextPath,
      "error",
      "Cafe24 OAuth state 검증에 실패했습니다.",
    );
  }

  try {
    await exchangeCafe24AuthorizationCode(code, admin.admin.userId);
    return createRedirectResponse(request, nextPath, "success");
  } catch (error) {
    return createRedirectResponse(
      request,
      nextPath,
      "error",
      error instanceof Error ? error.message : "Cafe24 OAuth 연결 중 오류가 발생했습니다.",
    );
  }
}
