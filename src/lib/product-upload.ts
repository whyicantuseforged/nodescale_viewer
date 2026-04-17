export interface CsvLeadRow {
  country?: string;
  company_name?: string;
  website_url?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  other_social?: string;
  linkedin?: string;
  spacer_j?: string;
  website_present?: string;
  phone_present?: string;
  email_present?: string;
  has_any_contact_channel?: string;
  sellable_status?: string;
  review_reason?: string;
  product_grade?: string;
  duplicate_group_id?: string;
  duplicate_group_size?: string;
}

export interface NormalizedLeadRow {
  country: string;
  company_name: string;
  website_url: string | null;
  phone: string | null;
  email: string | null;
  facebook: string | null;
  instagram: string | null;
  other_social: string | null;
  linkedin: string | null;
  website_present: boolean;
  phone_present: boolean;
  email_present: boolean;
  has_any_contact_channel: boolean;
  sellable_status: string;
  review_reason: string | null;
  product_grade: "basic" | "verified" | "contact_enriched";
  duplicate_group_id: string | null;
  duplicate_group_size: number;
  raw_payload: Record<string, unknown>;
}

export interface RowValidationResult {
  ok: boolean;
  normalized?: NormalizedLeadRow;
  error?: string;
}

function normalizeText(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeBoolean(value?: string) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "y";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateLeadRow(input: CsvLeadRow): RowValidationResult {
  const companyName = normalizeText(input.company_name);
  const country = normalizeText(input.country);

  if (!companyName) {
    return { ok: false, error: "company_name is required" };
  }

  if (!country) {
    return { ok: false, error: "country is required" };
  }

  const email = normalizeText(input.email);
  const websiteUrl = normalizeText(input.website_url);

  if (email && !isValidEmail(email)) {
    return { ok: false, error: "invalid email format" };
  }

  if (websiteUrl && !isValidUrl(websiteUrl)) {
    return { ok: false, error: "invalid website_url format" };
  }

  const productGradeRaw = normalizeText(input.product_grade)?.toLowerCase() ?? "basic";
  if (!["basic", "verified", "contact_enriched"].includes(productGradeRaw)) {
    return { ok: false, error: "invalid product_grade" };
  }

  const duplicateGroupSizeRaw = normalizeText(input.duplicate_group_size) ?? "1";
  const duplicateGroupSize = Number.parseInt(duplicateGroupSizeRaw, 10);
  if (!Number.isFinite(duplicateGroupSize) || duplicateGroupSize < 1) {
    return { ok: false, error: "invalid duplicate_group_size" };
  }

  return {
    ok: true,
    normalized: {
      country,
      company_name: companyName,
      website_url: websiteUrl,
      phone: normalizeText(input.phone),
      email,
      facebook: normalizeText(input.facebook),
      instagram: normalizeText(input.instagram),
      other_social: normalizeText(input.other_social),
      linkedin: normalizeText(input.linkedin),
      website_present: normalizeBoolean(input.website_present),
      phone_present: normalizeBoolean(input.phone_present),
      email_present: normalizeBoolean(input.email_present),
      has_any_contact_channel: normalizeBoolean(input.has_any_contact_channel),
      sellable_status: normalizeText(input.sellable_status)?.toLowerCase() ?? "sellable",
      review_reason: normalizeText(input.review_reason),
      product_grade: productGradeRaw as NormalizedLeadRow["product_grade"],
      duplicate_group_id: normalizeText(input.duplicate_group_id),
      duplicate_group_size: duplicateGroupSize,
      raw_payload: {
        country: input.country ?? "",
        company_name: input.company_name ?? "",
        website_url: input.website_url ?? "",
        phone: input.phone ?? "",
        email: input.email ?? "",
        facebook: input.facebook ?? "",
        instagram: input.instagram ?? "",
        other_social: input.other_social ?? "",
        linkedin: input.linkedin ?? "",
        website_present: input.website_present ?? "",
        phone_present: input.phone_present ?? "",
        email_present: input.email_present ?? "",
        has_any_contact_channel: input.has_any_contact_channel ?? "",
        sellable_status: input.sellable_status ?? "",
        review_reason: input.review_reason ?? "",
        product_grade: input.product_grade ?? "",
        duplicate_group_id: input.duplicate_group_id ?? "",
        duplicate_group_size: input.duplicate_group_size ?? "",
      },
    },
  };
}
