import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import {
  getCafe24IntegrationSummary,
  getCafe24MallId,
  getCafe24OauthScopes,
} from "@/lib/cafe24";

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
      ? "Cafe24 OAuth connection completed."
      : searchParams?.cafe24 === "error"
        ? searchParams.message ?? "Cafe24 OAuth connection failed."
        : null;

  return (
    <section className="grid">
      <div className="card grid">
        <div>
          <h1>Cafe24 Integration</h1>
          <p className="muted">
            Manage order and product API connection status for mall <strong>{mallId}</strong>.
          </p>
        </div>

        {statusMessage ? (
          <p style={{ color: searchParams?.cafe24 === "success" ? "#067647" : "#b42318" }}>
            {statusMessage}
          </p>
        ) : null}

        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        >
          <div className="card">
            <strong>Connection</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {integration ? "Connected" : "Not connected"}
            </p>
          </div>
          <div className="card">
            <strong>Requested Scopes</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {requestedScopes.join(", ")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/api/cafe24/oauth/start?next=/admin/integrations">
            Start Cafe24 OAuth
          </Link>
        </div>
      </div>

      <div className="card grid">
        <h2>Stored Token Status</h2>
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
                <td>
                  {integration.issued_at
                    ? new Date(integration.issued_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
              </tr>
              <tr>
                <th align="left">Access Token Expires</th>
                <td>
                  {integration.expires_at
                    ? new Date(integration.expires_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
              </tr>
              <tr>
                <th align="left">Refresh Token Expires</th>
                <td>
                  {integration.refresh_token_expires_at
                    ? new Date(integration.refresh_token_expires_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
              </tr>
              <tr>
                <th align="left">Last Sync</th>
                <td>
                  {integration.last_synced_at
                    ? new Date(integration.last_synced_at).toLocaleString("ko-KR")
                    : "-"}
                </td>
              </tr>
              <tr>
                <th align="left">Last Error</th>
                <td>{integration.last_error ?? "-"}</td>
              </tr>
              <tr>
                <th align="left">Updated At</th>
                <td>{new Date(integration.updated_at).toLocaleString("ko-KR")}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="muted">
            No Cafe24 token is stored yet. Start the OAuth connection first.
          </p>
        )}
      </div>
    </section>
  );
}