# Nodescale Viewer Web

이 폴더는 `Next.js + Supabase + Cafe24` 기반의 외부 열람앱입니다.

포함된 기능:

- `/admin` 관리자 대시보드
- 샘플 수기 등록/수정/삭제 UI
- CSV 업로드 UI와 업로드 이력 조회
- Cafe24 OAuth 연동 상태 페이지
- 구매/기간권 조회 페이지
- `/products/[code]` 상품별 샘플/실데이터 열람 페이지
- `src/proxy.ts` 기반의 `/admin/*` 보호

## 실행 전 준비

1. `.env.local.template` 파일을 복사해 `.env.local` 생성
2. Supabase 프로젝트 URL / 키 입력
3. Cafe24 OAuth 값 입력
4. 필요한 Supabase 마이그레이션 적용

## 필수 환경변수

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CAFE24_MALL_ID`
- `CAFE24_CLIENT_ID`
- `CAFE24_CLIENT_SECRET`
- `CAFE24_OAUTH_REDIRECT_URI`

## 드래그앤드롭용 환경변수 템플릿

- 로컬 실행용: `web/.env.local.template`
- Vercel 입력용: `web/.env.vercel.template`

이 템플릿에는 이미 아래 값이 반영되어 있습니다.

- `CAFE24_MALL_ID=nodescale`
- `CAFE24_CLIENT_ID=09Gez8oSSy0XxPzjKJNTBA`

## GitHub/Vercel 업로드 시 주의

절대 업로드하지 말 것:

- `.env.local`
- 실제 비밀값을 채운 환경변수 파일
- `.next`
- `node_modules`
- `tsconfig.tsbuildinfo`
- `src/middleware.ts`

이 저장소에서는 `src/proxy.ts` 만 사용합니다.

## 설치 및 실행

```bash
npm install
npm run dev
```

## Supabase 마이그레이션 참고

- `web/supabase/migrations/20260417_admin_console_support.sql`
- `web/supabase/migrations/20260418_lead_package_items.sql`
- `web/supabase/migrations/20260418_cafe24_order_sync.sql`
- `web/supabase/migrations/20260418_cafe24_oauth_integrations.sql`

## 관리자 권한 부여

`profiles.is_admin = true` 로 지정된 사용자만 `/admin` 경로에 접근할 수 있습니다.
