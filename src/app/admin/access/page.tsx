import { getAdminAccessData } from "@/lib/admin-data";

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
          <h1>구매 및 이용권 조회</h1>
          <p className="muted">
            사용자, 주문번호, 상품 기준으로 결제 이력과 기간권 상태를 함께 확인합니다.
          </p>
        </div>

        <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="이메일, 이름, 주문번호, 상품코드로 검색"
            style={{ maxWidth: 360 }}
          />
          <button type="submit">검색</button>
        </form>
      </section>

      <section className="card grid">
        <h2>최근 결제</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">사용자</th>
                <th align="left">상품</th>
                <th align="left">주문번호</th>
                <th align="left">금액</th>
                <th align="left">상태</th>
                <th align="left">결제 시각</th>
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
                    <td>{payment.amount.toLocaleString()}원</td>
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
        <h2>상품별 이용권</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">사용자</th>
                <th align="left">상품</th>
                <th align="left">시작일</th>
                <th align="left">만료일</th>
                <th align="left">상태</th>
                <th align="left">남은 기간</th>
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
                    <td>{daysRemaining}일</td>
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
