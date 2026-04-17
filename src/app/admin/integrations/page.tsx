import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { getCafe24IntegrationSummary, getCafe24MallId, getCafe24OauthScopes } from "@/lib/cafe24";

export const dynamic = "force-dynamic";

export default async function AdminIntegrationsPage(
  props: { searchParams?: Promise<{ cafe24?: string; message?: string; mall?: string }> },
) {
  await requireAdminPage("/admin/integrations");
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const integration = await getCafe24IntegrationSummary();
  const mallId = getCafe24MallId();
  const requestedScopes = getCafe24OauthScopes()
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

  const statusMessage =
    searchParams?.cafe24 === "success"
      ? "Cafe24 OAuth ?곌껐???꾨즺?섏뿀?듬땲??"
      : searchParams?.cafe24 === "error"
        ? searchParams.message ?? "Cafe24 OAuth ?곌껐 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎."
        : null;

  return (
    <section className="grid">
      <div className="card grid">
        <div>
          <h1>Cafe24 ?곕룞</h1>
          <p className="muted">
            紐?ID <strong>{mallId}</strong> ??二쇰Ц/?곹뭹 API ?곌껐 ?곹깭瑜?愿由ы빀?덈떎.
          </p>
        </div>

        {statusMessage ? (
          <p style={{ color: searchParams?.cafe24 === "success" ? "#067647" : "#b42318" }}>
            {statusMessage}
          </p>
        ) : null}

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card">
            <strong>?곌껐 ?곹깭</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {integration ? "?곌껐?? : "誘몄뿰寃?}
            </p>
          </div>
          <div className="card">
            <strong>?붿껌 Scope</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {requestedScopes.join(", ")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/api/cafe24/oauth/start?next=/admin/integrations">
            Cafe24 OAuth ?곌껐 ?쒖옉
          </Link>
        </div>
      </div>

      <div className="card grid">
        <h2>?꾩옱 ??λ맂 ?좏겙 ?곹깭</h2>
        {integration ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <th align="left">Mall ID</th>
                <td>{integration.mall_id}</td>
              </tr>
              <tr>
                <th align="left">Shop No</th>
                <td>{integration.shop_no ?? "-"}</td>
              </tr>
              <tr>
                <th align="left">Token Type</th>
                <td>{integration.token_type ?? "-"}</td>
              </tr>
              <tr>
                <th align="left">Scopes</th>
                <td>{integration.scopes.join(", ") || "-"}</td>
              </tr>
              <tr>
                <th align="left">Issued At</th>
                <td>{integration.issued_at ? new Date(integration.issued_at).toLocaleString("ko-KR") : "-"}</td>
              </tr>
              <tr>
                <th align="left">Access Token 留뚮즺</th>
                <td>{integration.expires_at ? new Date(integration.expires_at).toLocaleString("ko-KR") : "-"}</td>
              </tr>
              <tr>
                <th align="left">Refresh Token 留뚮즺</th>
                <td>{integration.refresh_token_expires_at ? new Date(integration.refresh_token_expires_at).toLocaleString("ko-KR") : "-"}</td>
              </tr>
              <tr>
                <th align="left">留덉?留??숆린??/th>
                <td>{integration.last_synced_at ? new Date(integration.last_synced_at).toLocaleString("ko-KR") : "-"}</td>
              </tr>
              <tr>
                <th align="left">理쒓렐 ?ㅻ쪟</th>
                <td>{integration.last_error ?? "-"}</td>
              </tr>
              <tr>
                <th align="left">媛깆떊 ?쒓컖</th>
                <td>{new Date(integration.updated_at).toLocaleString("ko-KR")}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="muted">
            ?꾩쭅 Cafe24 ?좏겙????λ릺吏 ?딆븯?듬땲?? 癒쇱? OAuth ?곌껐??吏꾪뻾??二쇱꽭??
          </p>
        )}
      </div>
    </section>
  );
}
