import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getLeadPackageRowPage,
  getProductAccessState,
  getProductByCode,
  getProductSamples,
  getViewerIdentity,
} from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function ProductPreviewPage(
  props: {
    params: Promise<{ code: string }>;
    searchParams?: Promise<{ page?: string }>;
  },
) {
  const { code } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const page = Math.max(1, Number.parseInt(searchParams?.page ?? "1", 10) || 1);
  const product = await getProductByCode(code);

  if (!product) {
    notFound();
  }

  const [sampleRows, viewer] = await Promise.all([
    getProductSamples(product.id),
    getViewerIdentity(),
  ]);
  const access = await getProductAccessState(product.id, viewer);
  const rowPage = access.hasAccess
    ? await getLeadPackageRowPage(product.id, page, 30)
    : null;

  const productPath = `/products/${product.code}`;
  const loginUrl = `/login?next=${encodeURIComponent(productPath)}`;

  return (
    <main style={{ maxWidth: 1080, margin: "40px auto" }} className="grid">
      <section className="card grid">
        <div>
          <h1>{product.title}</h1>
          <p className="muted">
            {product.region} / {product.sector} / {product.category}
          </p>
        </div>
        <div className="grid" style={{ gap: 12 }}>
          <p>{product.description ?? "상품 설명이 아직 등록되지 않았습니다."}</p>
          <p>가격: {product.price.toLocaleString()}원</p>
          <p>이용 기간: {product.access_days}일</p>
          <p>전체 행 수: {product.total_rows.toLocaleString()}건</p>
        </div>
      </section>

      <section className="card grid">
        <div>
          <h2>이용 상태</h2>
          {access.hasAccess ? (
            <>
              <p className="muted">
                현재 이 상품에 대한 활성 기간권이 있습니다.
                {access.accessEndAt
                  ? ` 만료일: ${new Date(access.accessEndAt).toLocaleString("ko-KR")}`
                  : ""}
              </p>
              <p>
                남은 기간: <strong>{access.daysRemaining ?? 0}일</strong>
              </p>
            </>
          ) : viewer.userId ? (
            <p className="muted">
              로그인은 되어 있지만 이 상품에 대한 활성 기간권이 없습니다. Cafe24 스토어에서
              해당 상품을 구매한 뒤 다시 접속해 주세요.
            </p>
          ) : (
            <p className="muted">
              실제 데이터 열람은 로그인 후 구매 권한이 확인된 계정에서만 가능합니다.
            </p>
          )}
        </div>

        {!viewer.userId ? (
          <div>
            <Link href={loginUrl}>로그인하고 열람 상태 확인</Link>
          </div>
        ) : null}
      </section>

      {rowPage ? (
        <section className="card grid">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2>실데이터 열람</h2>
              <p className="muted">
                페이지당 {rowPage.pageSize}행씩 표시합니다. 현재 {rowPage.page} / {rowPage.totalPages} 페이지
              </p>
            </div>
            <div className="pill">총 {rowPage.totalRows.toLocaleString()}행</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">행</th>
                  <th align="left">국가</th>
                  <th align="left">회사명</th>
                  <th align="left">웹사이트</th>
                  <th align="left">전화번호</th>
                  <th align="left">이메일</th>
                  <th align="left">등급</th>
                </tr>
              </thead>
              <tbody>
                {rowPage.rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.row_no}</td>
                    <td>{row.country}</td>
                    <td>{row.company_name}</td>
                    <td>
                      {row.website_url ? (
                        <a href={row.website_url} target="_blank" rel="noreferrer">
                          {row.website_url}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{row.phone ?? "-"}</td>
                    <td>{row.email ?? "-"}</td>
                    <td>{row.product_grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {rowPage.page > 1 ? (
              <Link href={`${productPath}?page=${rowPage.page - 1}`}>이전 30행</Link>
            ) : (
              <span className="muted">이전 30행</span>
            )}
            <span className="muted">
              {Math.max(1, (rowPage.page - 1) * rowPage.pageSize + 1)}-
              {Math.min(rowPage.page * rowPage.pageSize, rowPage.totalRows)}행 표시
            </span>
            {rowPage.page < rowPage.totalPages ? (
              <Link href={`${productPath}?page=${rowPage.page + 1}`}>다음 30행</Link>
            ) : (
              <span className="muted">다음 30행</span>
            )}
          </div>
        </section>
      ) : null}

      <section className="card grid">
        <h2>샘플 미리보기</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">회사명</th>
                <th align="left">담당자</th>
                <th align="left">국가</th>
                <th align="left">이메일</th>
                <th align="left">전화번호</th>
                <th align="left">웹사이트</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((sample) => (
                <tr key={sample.id}>
                  <td>{sample.company_name}</td>
                  <td>{sample.contact_name}</td>
                  <td>{sample.country}</td>
                  <td>{sample.email_masked}</td>
                  <td>{sample.phone_masked}</td>
                  <td>{sample.website}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
