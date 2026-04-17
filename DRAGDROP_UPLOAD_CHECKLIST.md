# Drag-and-Drop Upload Checklist

1. GitHub 저장소에서 기존 `.env.local` 파일을 삭제합니다.
2. GitHub 저장소에 빈 `web` 파일이 남아 있으면 삭제합니다.
3. 이 폴더 안의 **내용물 전체**를 선택해서 GitHub 업로드 화면으로 드래그합니다.
4. 폴더 자체를 올리지 말고, 이 폴더 안의 파일과 폴더를 저장소 루트에 올립니다.
5. 업로드 후 저장소 루트에 아래가 보여야 정상입니다.
   - `src`
   - `supabase`
   - `package.json`
   - `next.config.ts`
   - `.env.example`
   - `.env.local.template`
   - `.env.vercel.template`
6. Vercel에서는 `Root Directory = ./` 로 둡니다.
7. 로컬 실행은 `.env.local.template` 을 복사해서 `.env.local` 로 사용합니다.
8. 실제 비밀값은 GitHub가 아니라 Vercel Environment Variables에 넣습니다.
9. 업로드 후 Vercel에서 재배포합니다.
