export interface SampleInputBody {
  company_name?: string;
  contact_name?: string;
  job_title?: string;
  country?: string;
  city?: string;
  email_masked?: string;
  phone_masked?: string;
  website?: string;
  row_order?: number;
}

function normalizeOptional(value?: string) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateRequiredSampleFields(body: SampleInputBody) {
  if (!body.company_name?.trim()) {
    return "company_name is required";
  }

  if (!body.country?.trim()) {
    return "country is required";
  }

  if (typeof body.row_order !== "number" || Number.isNaN(body.row_order)) {
    return "row_order is required";
  }

  return null;
}

export function buildSamplePayload(body: SampleInputBody) {
  const payload: Record<string, unknown> = {};

  if (typeof body.company_name === "string") {
    payload.company_name = body.company_name.trim();
  }
  if (typeof body.contact_name === "string") {
    payload.contact_name = normalizeOptional(body.contact_name);
  }
  if (typeof body.job_title === "string") {
    payload.job_title = normalizeOptional(body.job_title);
  }
  if (typeof body.country === "string") {
    payload.country = body.country.trim();
  }
  if (typeof body.city === "string") {
    payload.city = normalizeOptional(body.city);
  }
  if (typeof body.email_masked === "string") {
    payload.email_masked = normalizeOptional(body.email_masked);
  }
  if (typeof body.phone_masked === "string") {
    payload.phone_masked = normalizeOptional(body.phone_masked);
  }
  if (typeof body.website === "string") {
    payload.website = normalizeOptional(body.website);
  }
  if (typeof body.row_order === "number") {
    payload.row_order = body.row_order;
  }

  return payload;
}
