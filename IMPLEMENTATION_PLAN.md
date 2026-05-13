# 🛒 Kế Hoạch Dự Án Web Bán Hàng (E-Commerce)

> **Ngày tạo:** 2026-05-12  
> **Workspace:** `c:\Users\Administrator\Desktop\TestNext`

---

## 📋 Tổng Quan

Web bán hàng full-stack với kiến trúc monorepo:
- **Frontend:** Next.js 16.x + React 19 + Tailwind CSS 4.x + shadcn/ui + Lucide React
- **Backend:** NestJS 11.x + Prisma 6.x + PostgreSQL
- **Monorepo:** Turborepo + pnpm

## 📁 Cấu Trúc

```
TestNext/
├── apps/
│   ├── web/          # Next.js 16 (port 3000)
│   └── api/          # NestJS 11 (port 8000)
├── packages/
│   ├── shared-types/ # Shared DTOs & interfaces
│   ├── shared-utils/ # Shared utilities
│   └── database/     # Prisma schema & client
├── skills/           # Skill files cho AI models
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 🚀 10 Phases

1. **Setup** - Khởi tạo monorepo, cài đặt, cấu hình
2. **Auth** - Đăng ký, đăng nhập, JWT, phân quyền
3. **Admin Products** - CRUD danh mục, sản phẩm, upload ảnh
4. **Storefront** - Homepage, listing, detail, search
5. **Cart & Wishlist** - Giỏ hàng, danh sách yêu thích
6. **Checkout & Payment** - Đặt hàng, thanh toán, mã giảm giá
7. **Order Management** - Theo dõi, quản lý đơn hàng
8. **Reviews** - Đánh giá sản phẩm
9. **Dashboard** - Admin analytics, quản lý users
10. **Polish & Deploy** - SEO, performance, dark mode, deploy

> Xem chi tiết từng phase trong thư mục `skills/`
