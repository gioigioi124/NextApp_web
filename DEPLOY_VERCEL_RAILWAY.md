# Deploy Vercel + Railway

Huong dan nay danh cho cau truc hien tai cua repo:

- Frontend: `apps/web` - Next.js
- Backend: `apps/api` - NestJS
- Database: `packages/database` - Prisma + PostgreSQL
- Package manager: `pnpm`

## 1. Nhung thu da duoc chuan bi trong repo

- Da them Vercel CLI va Railway CLI vao devDependencies.
- Da them script `db:migrate:deploy` de chay Prisma migration production.
- Da them migration dau tien tai `packages/database/prisma/migrations/20260518000000_init`.
- Da sua upload API de khong hardcode `localhost`; backend dung `API_PUBLIC_URL` hoac `RAILWAY_PUBLIC_DOMAIN`.
- Da them `UPLOADS_DIR` de co the gan Railway Volume cho anh upload.
- Da them `railway.toml` cho API service: build, start, healthcheck va restart policy.

Kiem tra CLI:

```bash
pnpm exec vercel --version
pnpm exec railway --version
```

Dang nhap CLI neu muon thao tac tu terminal:

```bash
pnpm exec vercel login
pnpm exec railway login
```

Ban van co the deploy bang dashboard cua Vercel/Railway. CLI khong bat buoc cho moi buoc.

## 2. Thong tin can chuan bi

Can co cac gia tri sau truoc khi go live:

```txt
WEB_DOMAIN=
API_DOMAIN=
DATABASE_URL=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Giai doan dau co the dung domain mac dinh:

```txt
WEB_DOMAIN=https://your-web.vercel.app
API_DOMAIN=https://your-api.up.railway.app
```

Tao `JWT_SECRET` manh:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Khong commit file `.env` len Git.

## 3. Kiem tra local truoc khi deploy

Chay tu thu muc goc repo:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm build
```

Neu build fail, sua loi local truoc khi deploy.

## 4. Push code len GitHub

Vercel va Railway nen deploy tu cung mot GitHub repo.

```bash
git status
git add .
git commit -m "Prepare Vercel and Railway deployment"
git push
```

Neu repo da co remote thi push len branch production cua ban, thuong la `main`.

## 5. Tao PostgreSQL tren Railway

1. Vao Railway Dashboard.
2. Tao project moi.
3. Add service `PostgreSQL`.
4. Mo PostgreSQL service, vao tab Variables.
5. Copy bien `DATABASE_URL`.

Gia tri nay se dung cho backend API service va cho lenh migration.

## 6. Deploy backend NestJS tren Railway

Trong Railway project:

1. Chon `New Service`.
2. Chon `GitHub Repo`.
3. Chon repo hien tai.
4. Service nay la API backend.

Cau hinh API service:

```txt
Root Directory: /
Build Command: pnpm db:generate && pnpm --filter api build
Start Command: pnpm --filter api start:prod
Healthcheck Path: /api/v1/health
```

Repo da co `railway.toml`, nen Railway co the tu doc cac gia tri tren. Neu dashboard hien gia tri khac, uu tien kiem tra deployment details de xem config dang lay tu dashboard hay tu file.

Them variables cho API service:

```env
DATABASE_URL=<Railway PostgreSQL DATABASE_URL>
JWT_SECRET=<secret tao bang lenh crypto>
NODE_ENV=production

WEB_URL=https://your-web.vercel.app
API_CORS_ORIGIN=https://your-web.vercel.app
API_PUBLIC_URL=https://your-api.up.railway.app
UPLOADS_DIR=/app/uploads
```

Ghi chu:

- Chua can set `PORT`; Railway se inject bien nay. Code da doc `process.env.PORT`.
- `API_PUBLIC_URL` khong co `/api/v1` o cuoi.
- `API_CORS_ORIGIN` co the la danh sach cach nhau bang dau phay.

## 7. Gan Railway Volume cho upload

Backend hien dang luu anh upload tren filesystem. Tren Railway, can gan Volume de anh khong mat sau deploy/restart.

Trong API service tren Railway:

1. Vao `Settings` hoac `Volumes`.
2. Add Volume.
3. Mount path:

```txt
/app/uploads
```

4. Dam bao variable cua API service co:

```env
UPLOADS_DIR=/app/uploads
```

Neu sau nay traffic/upload nhieu, nen chuyen sang object storage nhu S3, Cloudflare R2, Supabase Storage, hoac Vercel Blob.

## 8. Chay Prisma migration production

Sau khi PostgreSQL da co `DATABASE_URL`, chay migration mot lan.

Bang Railway CLI:

```bash
pnpm exec railway link
pnpm exec railway run pnpm db:migrate:deploy
```

Hoac chay local voi `DATABASE_URL` production da export:

PowerShell:

```powershell
$env:DATABASE_URL="<Railway PostgreSQL DATABASE_URL>"
pnpm db:migrate:deploy
```

Bash:

```bash
DATABASE_URL="<Railway PostgreSQL DATABASE_URL>" pnpm db:migrate:deploy
```

Khong dung `pnpm db:push` cho production.

## 9. Test backend

Sau khi API deploy thanh cong, mo:

```txt
https://your-api.up.railway.app/api/v1/health
```

Hoac dung curl:

```bash
curl https://your-api.up.railway.app/api/v1/health
```

Neu loi:

- Xem Railway deployment logs.
- Kiem tra `DATABASE_URL`.
- Kiem tra migration da chay chua.
- Kiem tra app co listen tren `process.env.PORT` khong. Repo nay da co san.

## 10. Deploy frontend Next.js tren Vercel

Trong Vercel Dashboard:

1. Chon `Add New Project`.
2. Import cung GitHub repo.
3. Cau hinh project frontend:

```txt
Framework Preset: Next.js
Root Directory: apps/web
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm --filter web build
Output Directory: de mac dinh
```

Voi monorepo, dam bao Vercel duoc phep doc workspace packages o ngoai `apps/web`. Neu build bao khong tim thay `shared-types` hoac `shared-utils`, vao project settings va bat tuy chon include source files outside root directory/build root.

Them Environment Variables tren Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/api/v1
API_URL=https://your-api.up.railway.app/api/v1
NEXT_PUBLIC_SITE_URL=https://your-web.vercel.app
```

Sau do deploy.

## 11. Cap nhat CORS sau khi co domain Vercel that

Khi Vercel deploy xong, copy production domain that, vi du:

```txt
https://your-web.vercel.app
```

Quay lai Railway API service va cap nhat:

```env
WEB_URL=https://your-web.vercel.app
API_CORS_ORIGIN=https://your-web.vercel.app
```

Redeploy API service.

## 12. Tao admin production

Sau khi database migration xong, tao admin:

PowerShell:

```powershell
$env:DATABASE_URL="<Railway PostgreSQL DATABASE_URL>"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="<mat-khau-manh>"
$env:ADMIN_NAME="Admin"
pnpm seed:admin
```

Bash:

```bash
DATABASE_URL="<Railway PostgreSQL DATABASE_URL>" \
ADMIN_EMAIL="admin@example.com" \
ADMIN_PASSWORD="<mat-khau-manh>" \
ADMIN_NAME="Admin" \
pnpm seed:admin
```

Doi `admin@example.com` va mat khau truoc khi chay.

## 13. Neu dung custom domain

Khuyen nghi:

```txt
Frontend: https://yourdomain.com
Backend:  https://api.yourdomain.com
```

Sau khi gan domain:

Railway API variables:

```env
WEB_URL=https://yourdomain.com
API_CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
API_PUBLIC_URL=https://api.yourdomain.com
```

Vercel web variables:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Redeploy ca hai service sau khi doi variables.

## 14. Checklist test sau deploy

Kiem tra tren frontend production:

```txt
[ ] Trang chu load du lieu san pham
[ ] Dang ky tai khoan
[ ] Dang nhap
[ ] Refresh trang van giu session neu app co luu token
[ ] Them san pham vao gio hang
[ ] Checkout tao don hang
[ ] Dang nhap admin
[ ] Tao category
[ ] Tao product
[ ] Upload anh product
[ ] Refresh trang va anh upload van hien thi
[ ] Browser console khong co CORS error
[ ] Railway logs khong co Prisma/JWT error
```

## 15. Cac loi thuong gap

### Vercel bao khong tim thay workspace package

Kiem tra:

```txt
Root Directory: apps/web
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm --filter web build
```

Bat tuy chon include files outside root directory neu can.

### Frontend goi API bi CORS

Kiem tra Railway API service:

```env
API_CORS_ORIGIN=https://your-web.vercel.app
WEB_URL=https://your-web.vercel.app
```

Sau do redeploy backend.

### Upload anh thanh cong nhung URL tra ve localhost

Kiem tra Railway API service:

```env
API_PUBLIC_URL=https://your-api.up.railway.app
```

Sau do redeploy backend.

### Anh upload mat sau deploy

Kiem tra Railway Volume da mount vao:

```txt
/app/uploads
```

Va variable:

```env
UPLOADS_DIR=/app/uploads
```

### Prisma bao table khong ton tai

Chay:

```bash
pnpm db:migrate:deploy
```

Dam bao lenh chay voi dung `DATABASE_URL` cua Railway PostgreSQL.

## 16. Link tai lieu chinh thuc

- Vercel Monorepos: https://vercel.com/docs/monorepos
- Vercel Build configuration: https://vercel.com/docs/builds/configure-a-build
- Railway Build and Start Commands: https://docs.railway.com/reference/build-and-start-commands
- Railway Healthchecks: https://docs.railway.com/reference/healthchecks
- Railway Config as Code: https://docs.railway.com/config-as-code/reference
