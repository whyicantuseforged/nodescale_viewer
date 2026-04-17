import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { getCafe24IntegrationSummary, getCafe24MallId, getCafe24OauthScopes } from "@/lib/cafe24";

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
      ? "Cafe24 OAuth 연결이 완료되었습니다."
      : searchParams?.cafe24 === "error"
        ? searchParams.message ?? "Cafe24 OAuth 연결 중 오류가 발생했습니다."
        : null;

  return (
    <section className="grid">
      <div className="card grid">
        <div>
          <h1>Cafe24 연동</h1>
          <p className="muted">
            몰 ID <strong>{mallId}</strong> 의 주문/상품 API 연결 상태를 관리합니다.
          </p>
        </div>

        {statusMessage ? (
          <p style={{ color: searchParams?.cafe24 === "success" ? "#067647" : "#b42318" }}>
            {statusMessage}
          </p>
        ) : null}

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card">
            <strong>연결 상태</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {integration ? "연결됨" : "미연결"}
            </p>
          </div>
          <div className="card">
            <strong>요청 Scope</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {requestedScopes.join(", ")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/api/cafe24/oauth/start?next=/admin/integrations">
            Cafe24 OAuth 연결 시작
          </Link>
        </div>
      </div>

      <div className="card grid">
        <h2>현재 저장된 토큰 상태</h2>
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
                <th align="left">Access Token 만료</th>
                <td>{integration.expires_at ? new Date(integration.expires_at).toLocaleString("ko-KR") : "-"}</td>
              </tr>
              <tr>
                <th align="left">Refresh Token 만료</th>
                <td>{integration.refresh_token_expires_at ? new Date(integration.refresh_token_expires_at).toLocaleString("ko-KR") : "-"}</td>
              </tr>
              <tr>
                <th align="left">마지막 동기화</th>
                <td>{integration.last_synced_at ? new Date(integration.last_synced_at).toLocaleString("ko-KR") : "-"}</td>
              </tr>
              <tr>
                <th align="left">최근 오류</th>
                <td>{integration.last_error ?? "-"}</td>
              </tr>
              <tr>
                <th align="left">갱신 시각</th>
                <td>{new Date(integration.updated_at).toLocaleString("ko-KR")}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="muted">
            아직 Cafe24 토큰이 저장되지 않았습니다. 먼저 OAuth 연결을 진행해 주세요.
          </p>
        )}
      </div>
    </section>
  );
}
