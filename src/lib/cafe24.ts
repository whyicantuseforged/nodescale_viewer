import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface Cafe24OrderItem {
  orderItemCode: string;
  productNo: number | null;
  productName: string | null;
  quantity: number;
}

export interface Cafe24OrderDetail {
  orderId: string;
  memberId: string | null;
  buyerEmail: string | null;
  buyerName: string | null;
  paymentConfirmed: boolean;
  items: Cafe24OrderItem[];
  raw: unknown;
}

export interface Cafe24SyncResult {
  ok: boolean;
  mallId: string;
  orderId: string;
  paymentConfirmed: boolean;
  processedItems: number;
  grantedItems: number;
  pendingItems: number;
  skippedItems: number;
  errorMessage?: string;
}

export interface Cafe24TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  issued_at?: string;
  expires_at?: string;
  refresh_token_expires_at?: string;
  mall_id?: string;
  shop_no?: string;
  user_id?: string;
  scopes?: string[];
  [key: string]: unknown;
}

export interface Cafe24IntegrationSummary {
  mall_id: string;
  shop_no: number | null;
  token_type: string | null;
  scopes: string[];
  issued_at: string | null;
  expires_at: string | null;
  refresh_token_expires_at: string | null;
  connected_at: string;
  last_synced_at: string | null;
  last_error: string | null;
  updated_at: string;
}

function getCafe24Env(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

export function getCafe24MallId() {
  return process.env.CAFE24_MALL_ID ?? "nodescale";
}

export function getCafe24OauthScopes() {
  return process.env.CAFE24_OAUTH_SCOPES ?? "mall.read_order,mall.read_product";
}

export function getCafe24OauthRedirectUri() {
  return (
    process.env.CAFE24_OAUTH_REDIRECT_URI ??
    `${getCafe24Env("NEXT_PUBLIC_APP_URL")}/api/cafe24/oauth/callback`
  );
}

export function createCafe24AuthorizationUrl(state: string) {
  const mallId = getCafe24MallId();
  const url = new URL(`https://${mallId}.cafe24api.com/api/v2/oauth/authorize`);

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", getCafe24ClientId());
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", getCafe24OauthRedirectUri());
  url.searchParams.set("scope", getCafe24OauthScopes());

  return url.toString();
}

function getCafe24ClientId() {
  return getCafe24Env("CAFE24_CLIENT_ID");
}

function getCafe24ClientSecret() {
  return getCafe24Env("CAFE24_CLIENT_SECRET");
}

function getCafe24ApiBaseUrl(mallId: string) {
  return `https://${mallId}.cafe24api.com/api/v2/admin`;
}

function getCafe24OauthBaseUrl(mallId: string) {
  return `https://${mallId}.cafe24api.com/api/v2/oauth`;
}

function normalizeScopes(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return [];
}

function getSafeDateString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

async function saveCafe24TokenResponse(
  mallId: string,
  token: Cafe24TokenResponse,
  installedBy?: string | null,
) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("cafe24_mall_integrations").upsert(
    {
      mall_id: mallId,
      shop_no:
        typeof token.shop_no === "string"
          ? Number.parseInt(token.shop_no, 10)
          : typeof token.shop_no === "number"
            ? token.shop_no
            : null,
      user_id: typeof token.user_id === "string" ? token.user_id : null,
      token_type: typeof token.token_type === "string" ? token.token_type : "Bearer",
      scopes: normalizeScopes(token.scopes),
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      issued_at: getSafeDateString(token.issued_at),
      expires_at: getSafeDateString(token.expires_at),
      refresh_token_expires_at: getSafeDateString(token.refresh_token_expires_at),
      connected_at: new Date().toISOString(),
      last_error: null,
      raw_response: token,
      installed_by: installedBy ?? null,
    },
    {
      onConflict: "mall_id",
    },
  );

  if (error) {
    throw new Error(error.message || "Failed to save Cafe24 integration token");
  }
}

async function getCafe24StoredIntegration(mallId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("cafe24_mall_integrations")
    .select(
      "id, mall_id, shop_no, access_token, refresh_token, token_type, scopes, issued_at, expires_at, refresh_token_expires_at, connected_at, last_synced_at, last_error, updated_at",
    )
    .eq("mall_id", mallId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to load Cafe24 integration");
  }

  return data;
}

async function markCafe24IntegrationError(mallId: string, message: string) {
  const admin = createSupabaseAdminClient();
  await admin
    .from("cafe24_mall_integrations")
    .update({
      last_error: message,
      updated_at: new Date().toISOString(),
    })
    .eq("mall_id", mallId);
}

async function touchCafe24IntegrationSync(mallId: string) {
  const admin = createSupabaseAdminClient();
  await admin
    .from("cafe24_mall_integrations")
    .update({
      last_synced_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("mall_id", mallId);
}

async function requestCafe24Token(
  mallId: string,
  params: Record<string, string>,
): Promise<Cafe24TokenResponse> {
  const response = await fetch(`${getCafe24OauthBaseUrl(mallId)}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: getCafe24ClientId(),
      client_secret: getCafe24ClientSecret(),
      ...params,
    }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : typeof data?.error_description === "string"
            ? data.error_description
            : "Cafe24 OAuth token request failed";
    throw new Error(message);
  }

  return data as Cafe24TokenResponse;
}

export async function exchangeCafe24AuthorizationCode(
  code: string,
  installedBy?: string | null,
) {
  const mallId = getCafe24MallId();
  const token = await requestCafe24Token(mallId, {
    grant_type: "authorization_code",
    code,
    redirect_uri: getCafe24OauthRedirectUri(),
  });

  await saveCafe24TokenResponse(mallId, token, installedBy);
  return token;
}

async function refreshCafe24AccessToken(mallId: string, refreshToken: string) {
  const token = await requestCafe24Token(mallId, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  await saveCafe24TokenResponse(mallId, token);
  return token;
}

async function getCafe24AccessToken() {
  const mallId = getCafe24MallId();
  const fallbackAccessToken = process.env.CAFE24_ACCESS_TOKEN;

  const stored = await getCafe24StoredIntegration(mallId);
  if (!stored) {
    if (fallbackAccessToken) {
      return fallbackAccessToken;
    }

    throw new Error("Cafe24 mall is not connected. Run the OAuth connection flow first.");
  }

  const expiresAt = stored.expires_at ? new Date(stored.expires_at) : null;
  const shouldRefresh =
    !expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now() + 5 * 60 * 1000;

  if (!shouldRefresh) {
    return stored.access_token;
  }

  try {
    const refreshed = await refreshCafe24AccessToken(mallId, stored.refresh_token);
    return refreshed.access_token;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to refresh Cafe24 access token";
    await markCafe24IntegrationError(mallId, message);

    if (fallbackAccessToken) {
      return fallbackAccessToken;
    }

    throw error;
  }
}

export async function getCafe24IntegrationSummary() {
  const mallId = getCafe24MallId();
  const stored = await getCafe24StoredIntegration(mallId);

  if (!stored) {
    return null;
  }

  return {
    mall_id: stored.mall_id,
    shop_no: stored.shop_no ?? null,
    token_type: stored.token_type ?? null,
    scopes: normalizeScopes(stored.scopes),
    issued_at: getSafeDateString(stored.issued_at),
    expires_at: getSafeDateString(stored.expires_at),
    refresh_token_expires_at: getSafeDateString(stored.refresh_token_expires_at),
    connected_at: stored.connected_at,
    last_synced_at: stored.last_synced_at ?? null,
    last_error: stored.last_error ?? null,
    updated_at: stored.updated_at,
  } satisfies Cafe24IntegrationSummary;
}

async function cafe24AdminFetch(path: string, init?: RequestInit) {
  const mallId = getCafe24MallId();
  const response = await fetch(`${getCafe24ApiBaseUrl(mallId)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await getCafe24AccessToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error?.message === "string"
          ? data.error.message
          : "Cafe24 API request failed";
    throw new Error(message);
  }

  return data;
}

function toOrderEntity(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Cafe24 order payload is empty");
  }

  const record = payload as Record<string, unknown>;
  if (record.order && typeof record.order === "object") {
    return record.order as Record<string, unknown>;
  }

  if (Array.isArray(record.orders) && record.orders[0] && typeof record.orders[0] === "object") {
    return record.orders[0] as Record<string, unknown>;
  }

  return record;
}

function normalizeCafe24OrderItem(item: Record<string, unknown>, index: number, orderId: string) {
  const productNoRaw = item.product_no;
  const parsedProductNo =
    typeof productNoRaw === "number"
      ? productNoRaw
      : typeof productNoRaw === "string"
        ? Number.parseInt(productNoRaw, 10)
        : NaN;

  const quantityRaw = item.quantity;
  const parsedQuantity =
    typeof quantityRaw === "number"
      ? quantityRaw
      : typeof quantityRaw === "string"
        ? Number.parseInt(quantityRaw, 10)
        : 1;

  const orderItemCode =
    typeof item.order_item_code === "string" && item.order_item_code
      ? item.order_item_code
      : `${orderId}-line-${index + 1}`;

  return {
    orderItemCode,
    productNo: Number.isFinite(parsedProductNo) ? parsedProductNo : null,
    productName: typeof item.product_name === "string" ? item.product_name : null,
    quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
  } satisfies Cafe24OrderItem;
}

export async function fetchCafe24OrderDetail(orderId: string): Promise<Cafe24OrderDetail> {
  const payload = await cafe24AdminFetch(
    `/orders/${encodeURIComponent(orderId)}?embed=items,buyer`,
  );

  const order = toOrderEntity(payload);
  const buyer =
    order.buyer && typeof order.buyer === "object"
      ? (order.buyer as Record<string, unknown>)
      : null;

  const rawItems =
    Array.isArray(order.items) ? order.items :
    Array.isArray((order as Record<string, unknown>).order_items)
      ? ((order as Record<string, unknown>).order_items as unknown[])
      : [];

  const items = rawItems
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item, index) => normalizeCafe24OrderItem(item, index, orderId));

  return {
    orderId:
      typeof order.order_id === "string" && order.order_id ? order.order_id : orderId,
    memberId: typeof order.member_id === "string" ? order.member_id : null,
    buyerEmail:
      typeof order.member_email === "string" && order.member_email
        ? order.member_email
        : typeof buyer?.email === "string"
          ? buyer.email
          : null,
    buyerName:
      typeof order.billing_name === "string" && order.billing_name
        ? order.billing_name
        : typeof buyer?.name === "string"
          ? buyer.name
          : null,
    paymentConfirmed: order.payment_confirmation === "T",
    items,
    raw: payload,
  };
}

async function upsertCafe24SyncLog(params: {
  mallId: string;
  orderId: string;
  buyerEmail: string | null;
  buyerName: string | null;
  paymentConfirmed: boolean;
  status: string;
  payload: unknown;
  processedItems?: number;
  grantedItems?: number;
  pendingItems?: number;
  skippedItems?: number;
  errorMessage?: string;
}) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("cafe24_order_sync_logs").upsert(
    {
      mall_id: params.mallId,
      order_id: params.orderId,
      buyer_email: params.buyerEmail,
      buyer_name: params.buyerName,
      payment_confirmed: params.paymentConfirmed,
      status: params.status,
      payload: params.payload,
      processed_items: params.processedItems ?? 0,
      granted_items: params.grantedItems ?? 0,
      pending_items: params.pendingItems ?? 0,
      skipped_items: params.skippedItems ?? 0,
      error_message: params.errorMessage ?? null,
      processed_at:
        params.status === "PENDING" || params.status === "PROCESSING"
          ? null
          : new Date().toISOString(),
    },
    {
      onConflict: "mall_id,order_id",
    },
  );

  if (error) {
    throw new Error(error.message || "Failed to write Cafe24 sync log");
  }
}

export async function syncCafe24Order(orderId: string): Promise<Cafe24SyncResult> {
  const mallId = getCafe24MallId();
  const order = await fetchCafe24OrderDetail(orderId);

  await upsertCafe24SyncLog({
    mallId,
    orderId: order.orderId,
    buyerEmail: order.buyerEmail,
    buyerName: order.buyerName,
    paymentConfirmed: order.paymentConfirmed,
    status: "PROCESSING",
    payload: order.raw,
  });

  if (!order.paymentConfirmed) {
    await upsertCafe24SyncLog({
      mallId,
      orderId: order.orderId,
      buyerEmail: order.buyerEmail,
      buyerName: order.buyerName,
      paymentConfirmed: false,
      status: "SKIPPED",
      payload: order.raw,
      processedItems: 0,
      grantedItems: 0,
      pendingItems: 0,
      skippedItems: order.items.length,
      errorMessage: "Payment is not confirmed yet",
    });

    return {
      ok: true,
      mallId,
      orderId: order.orderId,
      paymentConfirmed: false,
      processedItems: 0,
      grantedItems: 0,
      pendingItems: 0,
      skippedItems: order.items.length,
    };
  }

  if (!order.buyerEmail) {
    const errorMessage = "Buyer email is missing on the Cafe24 order";

    await upsertCafe24SyncLog({
      mallId,
      orderId: order.orderId,
      buyerEmail: null,
      buyerName: order.buyerName,
      paymentConfirmed: true,
      status: "FAILED",
      payload: order.raw,
      errorMessage,
    });

    return {
      ok: false,
      mallId,
      orderId: order.orderId,
      paymentConfirmed: true,
      processedItems: 0,
      grantedItems: 0,
      pendingItems: 0,
      skippedItems: 0,
      errorMessage,
    };
  }

  const productNos = Array.from(
    new Set(order.items.map((item) => item.productNo).filter((value): value is number => value !== null)),
  );

  const admin = createSupabaseAdminClient();
  const { data: mappings, error: mappingError } = await admin
    .from("cafe24_product_mappings")
    .select("cafe24_product_no, product_id")
    .eq("mall_id", mallId)
    .eq("is_active", true)
    .in("cafe24_product_no", productNos);

  if (mappingError) {
    throw new Error(mappingError.message || "Failed to load Cafe24 product mappings");
  }

  const productIds = Array.from(new Set((mappings ?? []).map((mapping) => mapping.product_id)));
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, access_days")
    .in("id", productIds);

  if (productsError) {
    throw new Error(productsError.message || "Failed to load mapped products");
  }

  const mappingByProductNo = new Map(
    (mappings ?? []).map((mapping) => [Number(mapping.cafe24_product_no), mapping.product_id]),
  );
  const productById = new Map((products ?? []).map((product) => [product.id, product]));

  const { data: matchingProfiles } = await admin
    .from("profiles")
    .select("id, email")
    .ilike("email", order.buyerEmail)
    .limit(1);

  const matchedUserId = matchingProfiles?.[0]?.id ?? null;

  let processedItems = 0;
  let grantedItems = 0;
  let pendingItems = 0;
  let skippedItems = 0;

  for (const item of order.items) {
    if (item.productNo === null) {
      skippedItems += 1;
      continue;
    }

    const productId = mappingByProductNo.get(item.productNo);
    if (!productId) {
      skippedItems += 1;
      continue;
    }

    const product = productById.get(productId);
    if (!product) {
      skippedItems += 1;
      continue;
    }

    processedItems += 1;
    const grantedDays = product.access_days * Math.max(1, item.quantity);

    if (matchedUserId) {
      const { error: rpcError } = await admin.rpc("grant_package_access", {
        p_user_id: matchedUserId,
        p_product_id: productId,
        p_access_days: grantedDays,
      });

      if (rpcError) {
        throw new Error(rpcError.message || "Failed to grant package access");
      }

      grantedItems += 1;
      continue;
    }

    const { error: pendingError } = await admin
      .from("pending_package_access_grants")
      .upsert(
        {
          mall_id: mallId,
          external_order_id: order.orderId,
          external_order_item_code: item.orderItemCode,
          product_id: productId,
          purchaser_email: order.buyerEmail,
          purchaser_name: order.buyerName,
          access_days: grantedDays,
          status: "PENDING",
          raw_payload: order.raw,
        },
        {
          onConflict: "mall_id,external_order_id,external_order_item_code",
        },
      );

    if (pendingError) {
      throw new Error(pendingError.message || "Failed to save pending access grant");
    }

    pendingItems += 1;
  }

  const status =
    grantedItems > 0 && pendingItems === 0
      ? "SUCCEEDED"
      : grantedItems > 0 || pendingItems > 0
        ? "PARTIAL"
        : "SKIPPED";

  await upsertCafe24SyncLog({
    mallId,
    orderId: order.orderId,
    buyerEmail: order.buyerEmail,
    buyerName: order.buyerName,
    paymentConfirmed: true,
    status,
    payload: order.raw,
    processedItems,
    grantedItems,
    pendingItems,
    skippedItems,
  });

  await touchCafe24IntegrationSync(mallId);

  return {
    ok: true,
    mallId,
    orderId: order.orderId,
    paymentConfirmed: true,
    processedItems,
    grantedItems,
    pendingItems,
    skippedItems,
  };
}

export function extractCafe24WebhookOrderId(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.order_id,
    record.orderId,
    record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>).order_id : null,
    record.resource && typeof record.resource === "object"
      ? (record.resource as Record<string, unknown>).order_id
      : null,
  ];

  const match = candidates.find((value) => typeof value === "string" && value);
  return typeof match === "string" ? match : null;
}
