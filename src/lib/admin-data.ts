import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface AdminDashboardData {
  metrics: Array<{ label: string; value: number }>;
  recentUploads: Array<{
    id: string;
    file_name: string;
    status: string;
    total_rows: number;
    success_rows: number;
    failed_rows: number;
    created_at: string;
  }>;
  recentPayments: Array<{
    id: string;
    order_id: string;
    amount: number;
    status: string;
    paid_at: string | null;
    created_at: string;
  }>;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const admin = createSupabaseAdminClient();

  const [
    { count: totalProducts },
    { count: publishedProducts },
    { count: readyProducts },
    { count: activeAccesses },
    { count: totalPayments },
    { data: recentUploads },
    { data: recentPayments },
  ] = await Promise.all([
    admin.from("products").select("*", { count: "exact", head: true }),
    admin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "PUBLISHED"),
    admin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "READY"),
    admin
      .from("package_access_passes")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE")
      .gt("access_end_at", new Date().toISOString()),
    admin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "PAID"),
    admin
      .from("product_upload_jobs")
      .select("id, file_name, status, total_rows, success_rows, failed_rows, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("payments")
      .select("id, order_id, amount, status, paid_at, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    metrics: [
      { label: "전체 상품", value: totalProducts ?? 0 },
      { label: "공개 상품", value: publishedProducts ?? 0 },
      { label: "업로드 검수 대기", value: readyProducts ?? 0 },
      { label: "활성 이용권", value: activeAccesses ?? 0 },
      { label: "결제 완료", value: totalPayments ?? 0 },
    ],
    recentUploads: recentUploads ?? [],
    recentPayments: recentPayments ?? [],
  };
}

export async function getAdminProducts() {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("products")
    .select(
      "id, code, title, region, sector, category, price, access_days, total_rows, status, created_at",
    )
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAdminProductSummary(productId: string) {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("products")
    .select("id, code, title, region, sector, category, total_rows, status")
    .eq("id", productId)
    .maybeSingle();

  return data;
}

export async function getAdminProductSamples(productId: string) {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("product_samples")
    .select(
      "id, company_name, contact_name, job_title, country, city, email_masked, phone_masked, website, row_order",
    )
    .eq("product_id", productId)
    .order("row_order", { ascending: true });

  return data ?? [];
}

export async function getAdminProductUploadJobs(productId: string) {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("product_upload_jobs")
    .select(
      "id, file_name, status, mode, total_rows, success_rows, failed_rows, error_message, created_at, completed_at",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function getAdminAccessData(keyword?: string) {
  const search = keyword?.trim().toLowerCase() ?? "";
  const admin = createSupabaseAdminClient();

  const [{ data: payments }, { data: passes }, { data: profiles }, { data: products }] =
    await Promise.all([
      admin
        .from("payments")
        .select("id, user_id, product_id, order_id, amount, status, paid_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      admin
        .from("package_access_passes")
        .select("id, user_id, product_id, access_start_at, access_end_at, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      admin.from("profiles").select("id, email, name"),
      admin.from("products").select("id, code, title"),
    ]);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const productMap = new Map((products ?? []).map((product) => [product.id, product]));

  const matchesKeyword = (...values: Array<string | null | undefined>) => {
    if (!search) return true;
    return values
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
  };

  const filteredPayments = (payments ?? []).filter((payment) => {
    const profile = profileMap.get(payment.user_id);
    const product = productMap.get(payment.product_id);

    return matchesKeyword(
      payment.order_id,
      profile?.email,
      profile?.name,
      product?.code,
      product?.title,
    );
  });

  const filteredPasses = (passes ?? []).filter((pass) => {
    const profile = profileMap.get(pass.user_id);
    const product = productMap.get(pass.product_id);

    return matchesKeyword(
      profile?.email,
      profile?.name,
      product?.code,
      product?.title,
    );
  });

  return {
    filteredPayments,
    filteredPasses,
    profileMap,
    productMap,
  };
}
