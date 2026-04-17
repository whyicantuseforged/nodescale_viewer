import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProductViewerProduct {
  id: string;
  code: string;
  title: string;
  region: string | null;
  sector: string | null;
  category: string | null;
  description: string | null;
  price: number;
  access_days: number;
  total_rows: number;
  status?: string | null;
}

export interface ViewerIdentity {
  userId: string | null;
  email?: string | null;
  isAdmin: boolean;
}

export interface ProductAccessState {
  hasAccess: boolean;
  accessStartAt?: string;
  accessEndAt?: string;
  daysRemaining?: number;
}

export interface LeadPackageRow {
  id: string;
  row_no: number;
  country: string;
  company_name: string;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  other_social: string | null;
  product_grade: string;
  duplicate_group_size: number;
}

export interface LeadPackageRowPage {
  rows: LeadPackageRow[];
  totalRows: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export async function getViewerIdentity(): Promise<ViewerIdentity> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      email: null,
      isAdmin: false,
    };
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    isAdmin: Boolean(profile?.is_admin),
  };
}

async function claimPendingAccessGrantsForViewer(viewer: ViewerIdentity) {
  if (!viewer.userId || !viewer.email) {
    return;
  }

  const admin = createSupabaseAdminClient();
  await admin.rpc("claim_pending_package_access_grants", {
    p_user_id: viewer.userId,
    p_email: viewer.email,
  });
}

export async function getProductByCode(code: string) {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("products")
    .select(
      "id, code, title, region, sector, category, description, price, access_days, total_rows, status",
    )
    .eq("code", code)
    .maybeSingle();

  return (data ?? null) as ProductViewerProduct | null;
}

export async function getProductAccessState(
  productId: string,
  viewer: ViewerIdentity,
): Promise<ProductAccessState> {
  if (!viewer.userId) {
    return { hasAccess: false };
  }

  if (viewer.isAdmin) {
    return { hasAccess: true };
  }

  await claimPendingAccessGrantsForViewer(viewer);

  const admin = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data: accessPass } = await admin
    .from("package_access_passes")
    .select("access_start_at, access_end_at")
    .eq("user_id", viewer.userId)
    .eq("product_id", productId)
    .eq("status", "ACTIVE")
    .gt("access_end_at", nowIso)
    .order("access_end_at", { ascending: false })
    .maybeSingle();

  if (!accessPass) {
    return { hasAccess: false };
  }

  const endAt = new Date(accessPass.access_end_at);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return {
    hasAccess: true,
    accessStartAt: accessPass.access_start_at,
    accessEndAt: accessPass.access_end_at,
    daysRemaining,
  };
}

export async function getProductSamples(productId: string) {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("product_samples")
    .select("id, company_name, contact_name, country, email_masked, phone_masked, website, row_order")
    .eq("product_id", productId)
    .order("row_order", { ascending: true });

  return data ?? [];
}

export async function getLeadPackageRowPage(
  packageId: string,
  page: number,
  pageSize: number,
): Promise<LeadPackageRowPage> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 100) : 30;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  const admin = createSupabaseAdminClient();
  const { data, count, error } = await admin
    .from("lead_package_items")
    .select(
      "id, row_no, country, company_name, website_url, phone, email, facebook, instagram, linkedin, other_social, product_grade, duplicate_group_size",
      { count: "exact" },
    )
    .eq("package_id", packageId)
    .order("row_no", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message || "Failed to load package rows");
  }

  const totalRows = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / safePageSize));

  return {
    rows: (data ?? []) as LeadPackageRow[],
    totalRows,
    totalPages,
    page: Math.min(safePage, totalPages),
    pageSize: safePageSize,
  };
}
