# Deploy Vercel + Render + Neon.tech

Hướng dẫn này dành cho cấu trúc hiện tại của repo (Monorepo Turborepo):

- **Frontend:** `apps/web` - Next.js (Deploy trên Vercel)
- **Backend:** `apps/api` - NestJS (Deploy trên Render Web Service)
- **Database:** `packages/database` - Prisma + PostgreSQL (Host trên Neon.tech)
- **Package manager:** `pnpm`

## 1. Những thứ đã được chuẩn bị trong repo

- Đã cấu hình `package.json` của thư mục `database` để biên dịch sang JavaScript (phù hợp với môi trường Node.js trên máy chủ).
- Thư viện `multer` đã được thêm vào mục dependencies của `api`.
- Các cấu hình TypeScript (`tsconfig.json`) đã được thiết lập `moduleResolution: nodenext` để tránh lỗi cú pháp và lỗi deprecation.

## 2. Thao tác tạo Database trên Neon.tech

Vì Render PostgreSQL bản Free sẽ hết hạn sau 30 ngày, chúng ta sử dụng **Neon.tech** làm cơ sở dữ liệu vĩnh viễn.

1. Đăng nhập Neon.tech, tạo Project mới.
2. Chọn phiên bản PostgreSQL mới nhất (15 hoặc 16).
3. Copy lại chuỗi kết nối `DATABASE_URL` (có dạng `postgresql://neondb_owner:...`).

## 3. Chạy Migration và Tạo Admin (Tại Local)

Mở Terminal (PowerShell hoặc Bash) tại máy tính của bạn và chạy lệnh sau để khởi tạo bảng và tài khoản Admin:

**PowerShell:**
```powershell
$env:DATABASE_URL="<DATABASE_URL_CUA_NEON>"
pnpm db:migrate:deploy

$env:ADMIN_EMAIL="admin@yourdomain.com"
$env:ADMIN_PASSWORD="<mat-khau-manh>"
$env:ADMIN_NAME="Admin"
pnpm seed:admin
```

## 4. Deploy Backend NestJS trên Render

1. Vào Render, chọn **New -> Web Service**.
2. Chọn kết nối với GitHub Repo của dự án.
3. **Cấu hình Service:**
   - **Root Directory:** *(Để trống)*
   - **Build Command:** 
     ```bash
     pnpm install --prod=false && pnpm db:generate && pnpm --filter database build && pnpm --filter api build
     ```
   - **Start Command:**
     ```bash
     pnpm --filter api start:prod
     ```
4. **Cấu hình Environment Variables:**
   - `DATABASE_URL` = `<DATABASE_URL_CUA_NEON>`
   - `JWT_SECRET` = `<Chuỗi bí mật tự tạo ngẫu nhiên>`
   - `NODE_ENV` = `production`
   - `NODE_VERSION` = `20` (hoặc `22` để chạy mượt hơn)
   - `UPLOADS_DIR` = `./uploads`

*(Lưu ý: Render Free không có bộ nhớ vĩnh viễn như Railway Volume, nên ảnh upload vào `./uploads` sẽ bị mất mỗi khi server sleep/restart. Nếu muốn lưu ảnh vĩnh viễn cho dự án thực tế, bạn cần tích hợp Cloudinary hoặc AWS S3 trong tương lai).*

## 5. Deploy Frontend Next.js trên Vercel

1. Vào Vercel, chọn **Add New Project**.
2. Chọn cùng GitHub Repo.
3. **Cấu hình:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - Đảm bảo tùy chọn cho phép Vercel đọc code ngoài Root Directory đã được bật (Monorepo support).
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://<ten-render-cua-ban>.onrender.com/api/v1`
   - `API_URL` = `https://<ten-render-cua-ban>.onrender.com/api/v1`
   - `NEXT_PUBLIC_SITE_URL` = `https://<ten-vercel-cua-ban>.vercel.app`

## 6. Cập nhật CORS sau khi có domain Vercel thật

Khi Vercel deploy xong, copy domain thật của nó. Quay lại Render API và thêm/sửa các biến sau:
- `WEB_URL` = `https://<ten-vercel-cua-ban>.vercel.app`
- `API_CORS_ORIGIN` = `https://<ten-vercel-cua-ban>.vercel.app`

Sau đó bấm **Manual Deploy** trên Render để cập nhật lại cấu hình chặn lỗi CORS.

## 7. Tổng hợp các lỗi thường gặp (Troubleshooting) đã được giải quyết

Trong quá trình deploy, nếu gặp lỗi tương tự, bạn có thể tra cứu các nguyên nhân kinh điển sau:

### 1. Lỗi `sh: 1: prisma: not found`
- **Nguyên nhân:** Khi set biến môi trường `NODE_ENV=production`, package manager `pnpm` sẽ bỏ qua việc cài đặt các gói trong `devDependencies`, khiến công cụ Prisma bị thiếu.
- **Cách sửa:** Thêm cờ `--prod=false` vào lệnh cài đặt trong Build Command trên Render (`pnpm install --prod=false`).

### 2. Lỗi `Cannot find module 'multer'` (Crash với Status 1)
- **Nguyên nhân:** Thư viện `multer` được dùng trực tiếp trong code nhưng lại không nằm trong mục `dependencies` của `apps/api/package.json`. Môi trường production của pnpm cực kỳ khắt khe sẽ báo lỗi ngay (khác với local dev có thể chạy chui).
- **Cách sửa:** Chạy lệnh `pnpm --filter api add multer` để lưu chuẩn thư viện vào dependencies.

### 3. Lỗi `SyntaxError: Unexpected token 'export'` (Cannot find module 'database')
- **Nguyên nhân:** Server dùng Node.js 20 mặc định không hiểu được code gốc TypeScript (ESM) từ package dùng chung `database`.
- **Cách sửa:** Thêm script `build: tsc` vào package database để dịch từ `.ts` sang `.js` (CommonJS), và cấu hình `moduleResolution: nodenext` trong `tsconfig.json`.

### 4. Lỗi `Property 'product' does not exist on type 'PrismaService'` (Kèm TS2307)
- **Nguyên nhân:** Hệ quả của việc package `database` chưa được build thành công ra file `.js` và `.d.ts` trước khi API được build.
- **Cách sửa:** Cập nhật Build Command tách bạch theo đúng thứ tự: Cài đặt (Install) -> Sinh code Prisma (Generate) -> Build DB -> Build API.

### 5. Quên biến `JWT_SECRET`
- **Nguyên nhân:** NestJS bảo mật mặc định sẽ tắt cái rụp (Exited with status 1) nếu thiếu chuỗi mã hóa phiên đăng nhập.
- **Cách sửa:** Khai báo ngay biến này vào Environment Variables trên máy chủ.
