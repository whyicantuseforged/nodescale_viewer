import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-data";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <section className="card grid">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>관리자 상품 목록</h1>
          <p className="muted">샘플 관리, CSV 업로드, 상품 상태 점검을 한 곳에서 진행합니다.</p>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">상품명</th>
              <th align="left">코드</th>
              <th align="left">분류</th>
              <th align="left">가격</th>
              <th align="left">이용 기간</th>
              <th align="left">전체 행</th>
              <th align="left">상태</th>
              <th align="left">작업</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.code}</td>
                <td>
                  {product.region} / {product.sector} / {product.category}
                </td>
                <td>{product.price.toLocaleString()}원</td>
                <td>{product.access_days}일</td>
                <td>{product.total_rows.toLocaleString()}</td>
                <td>{product.status}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/admin/products/${product.id}/samples`}>
                      샘플 관리
                    </Link>
                    <Link href={`/admin/products/${product.id}/upload`}>
                      업로드
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
