import { getAdminAccessData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

interface AccessPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function AdminAccessPage({ searchParams }: AccessPageProps) {
  const { q } = await searchParams;
  const { filteredPayments, filteredPasses, profileMap, productMap } =
    await getAdminAccessData(q);

  return (
    <div className="grid">
      <section className="card grid">
        <div>
          <h1>援щℓ 諛??댁슜沅?議고쉶</h1>
          <p className="muted">
            ?ъ슜?? 二쇰Ц踰덊샇, ?곹뭹 湲곗??쇰줈 寃곗젣 ?대젰怨?湲곌컙沅??곹깭瑜??④퍡 ?뺤씤?⑸땲??
          </p>
        </div>

        <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="?대찓?? ?대쫫, 二쇰Ц踰덊샇, ?곹뭹肄붾뱶濡?寃??
            style={{ maxWidth: 360 }}
          />
          <button type="submit">寃??/button>
        </form>
      </section>

      <section className="card grid">
        <h2>理쒓렐 寃곗젣</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">?ъ슜??/th>
                <th align="left">?곹뭹</th>
                <th align="left">二쇰Ц踰덊샇</th>
                <th align="left">湲덉븸</th>
                <th align="left">?곹깭</th>
                <th align="left">寃곗젣 ?쒓컖</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const profile = profileMap.get(payment.user_id);
                const product = productMap.get(payment.product_id);

                return (
                  <tr key={payment.id}>
                    <td>{profile?.email ?? profile?.name ?? payment.user_id}</td>
                    <td>{product?.title ?? product?.code ?? payment.product_id}</td>
                    <td>{payment.order_id}</td>
                    <td>{payment.amount.toLocaleString()}??/td>
                    <td>{payment.status}</td>
                    <td>
                      {(payment.paid_at ?? payment.created_at) &&
                        new Date(payment.paid_at ?? payment.created_at).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card grid">
        <h2>?곹뭹蹂??댁슜沅?/h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">?ъ슜??/th>
                <th align="left">?곹뭹</th>
                <th align="left">?쒖옉??/th>
                <th align="left">留뚮즺??/th>
                <th align="left">?곹깭</th>
                <th align="left">?⑥? 湲곌컙</th>
              </tr>
            </thead>
            <tbody>
              {filteredPasses.map((pass) => {
                const profile = profileMap.get(pass.user_id);
                const product = productMap.get(pass.product_id);
                const end = new Date(pass.access_end_at);
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                );

                return (
                  <tr key={pass.id}>
                    <td>{profile?.email ?? profile?.name ?? pass.user_id}</td>
                    <td>{product?.title ?? product?.code ?? pass.product_id}</td>
                    <td>{new Date(pass.access_start_at).toLocaleString("ko-KR")}</td>
                    <td>{new Date(pass.access_end_at).toLocaleString("ko-KR")}</td>
                    <td>{pass.status}</td>
                    <td>{daysRemaining}??/td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
