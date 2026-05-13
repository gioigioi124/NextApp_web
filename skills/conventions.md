# Skill: Quy Ước Code & Cấu Trúc Dự Án E-Commerce

> **Đọc file này TRƯỚC KHI bắt đầu bất kỳ phase nào.**
> File này chứa các quy tắc BẮT BUỘC mà mọi AI model phải tuân theo.

---

## 🛠️ Tech Stack Cố Định

```
Frontend: Next.js 16.x | React 19.x | Tailwind CSS 4.x | shadcn/ui | Lucide React | Zustand
Backend:  NestJS 11.x | Prisma 6.x | PostgreSQL 16+ | Passport + JWT | Zod
Tooling:  Turborepo | pnpm | TypeScript 5.x
```

## 📁 Cấu Trúc File

### Backend (apps/api)
```
apps/api/src/
├── modules/
│   └── <module-name>/
│       ├── <module-name>.module.ts
│       ├── <module-name>.controller.ts
│       ├── <module-name>.service.ts
│       ├── dto/
│       │   ├── create-<name>.dto.ts
│       │   └── update-<name>.dto.ts
│       └── entities/
│           └── <name>.entity.ts
├── common/
│   ├── decorators/     # Custom decorators (@CurrentUser, @Roles)
│   ├── guards/         # JwtAuthGuard, RolesGuard
│   ├── filters/        # HttpExceptionFilter
│   ├── interceptors/   # TransformInterceptor
│   └── pipes/          # ZodValidationPipe
├── config/             # ConfigModule setup
├── prisma/             # PrismaService, PrismaModule
├── app.module.ts
└── main.ts
```

### Frontend (apps/web)
```
apps/web/
├── app/
│   ├── (auth)/         # Route group: login, register
│   ├── (shop)/         # Route group: products, cart, checkout
│   ├── (admin)/        # Route group: admin dashboard
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles + Tailwind
├── components/
│   ├── ui/             # shadcn components (auto-generated)
│   ├── layout/         # Header, Footer, Sidebar, Navbar
│   ├── product/        # ProductCard, ProductGrid, ProductDetail
│   ├── cart/           # CartDrawer, CartItem, CartSummary
│   └── admin/          # AdminSidebar, DataTable, StatsCard
├── hooks/              # useAuth, useCart, useProducts
├── lib/                # utils.ts, api-client.ts, constants.ts
├── services/           # auth.service.ts, product.service.ts
├── stores/             # Zustand stores (cart, auth)
└── types/              # Frontend-specific types
```

## 📏 Naming Conventions

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Files/Folders | kebab-case | `product-card.tsx`, `auth-guard.ts` |
| React Components | PascalCase | `ProductCard`, `CartDrawer` |
| Functions/Variables | camelCase | `getProducts`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_ITEMS` |
| Types/Interfaces | PascalCase + prefix I cho interface | `Product`, `IAuthContext` |
| CSS classes | Tailwind utilities | `className="flex items-center gap-2"` |
| API endpoints | kebab-case, plural nouns | `/api/v1/products`, `/api/v1/order-items` |
| Database tables | PascalCase (Prisma) | `Product`, `OrderItem` |
| Env variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET` |

## 🌐 API Conventions

### Base URL
```
Development: http://localhost:8000/api/v1
Production:  https://api.example.com/api/v1
```

### Response Format

**Thành công (single):**
```json
{
  "data": { ... },
  "message": "Product created successfully"
}
```

**Thành công (list với pagination):**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

**Lỗi:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [ ... ],
  "timestamp": "2026-05-12T10:00:00.000Z"
}
```

### HTTP Methods
- `GET` - Lấy dữ liệu
- `POST` - Tạo mới
- `PATCH` - Cập nhật một phần
- `DELETE` - Xóa

### Authentication
```
Header: Authorization: Bearer <access_token>
```

## 🔒 Auth Flow

```
1. User đăng ký  → POST /api/v1/auth/register → trả về { user }
2. User đăng nhập → POST /api/v1/auth/login    → trả về { accessToken, refreshToken }
3. Gọi API       → Header: Authorization: Bearer <accessToken>
4. Token hết hạn → POST /api/v1/auth/refresh   → trả về { accessToken }
5. Đăng xuất     → POST /api/v1/auth/logout    → xóa refreshToken
```

### Roles
- `CUSTOMER` - Mua hàng, xem đơn, đánh giá
- `STAFF` - Quản lý sản phẩm, đơn hàng
- `ADMIN` - Toàn quyền

## 🎨 UI/UX Guidelines

### Design System
- **Font:** Inter (Google Fonts)
- **Colors:** Dùng CSS variables của shadcn theme
- **Icons:** Lucide React only - `import { ShoppingCart, User } from "lucide-react"`
- **Components:** Ưu tiên shadcn/ui, custom khi cần
- **Animations:** Framer Motion cho page transitions, CSS transitions cho hover

### shadcn Components cần cài
```bash
# Phase 1-2 (Setup + Auth)
npx shadcn@latest add button input label card form toast
npx shadcn@latest add dropdown-menu avatar sheet dialog

# Phase 3-4 (Products + Storefront)
npx shadcn@latest add table badge select textarea tabs
npx shadcn@latest add carousel skeleton separator command

# Phase 5-6 (Cart + Checkout)
npx shadcn@latest add drawer scroll-area radio-group checkbox

# Phase 7-9 (Orders + Reviews + Dashboard)
npx shadcn@latest add progress chart tooltip popover
```

### Responsive Breakpoints (Tailwind CSS 4)
```css
/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */
/* Mobile-first approach: base styles → sm → md → lg → xl */
```

## 🗄️ Database Rules

- Dùng `cuid()` cho primary keys
- Luôn có `createdAt` và `updatedAt`
- Index các trường query thường xuyên
- Soft delete khi cần (thêm `deletedAt DateTime?`)
- Decimal(12,2) cho tiền tệ

## 📦 Shared Packages

### packages/shared-types
```typescript
// Chứa interfaces/types dùng chung giữa frontend và backend
// Export từ index.ts
export type { Product, Category, User, Order, CartItem } from './models'
export type { CreateProductDto, UpdateProductDto } from './dto'
export type { PaginatedResponse, ApiResponse } from './api'
```

### packages/shared-utils
```typescript
// Chứa utilities dùng chung
export { formatPrice, formatDate, slugify } from './formatters'
export { productSchema, loginSchema } from './validations' // Zod schemas
```

## ⚠️ Lưu Ý Quan Trọng

1. **KHÔNG dùng `pages/` router** - Chỉ dùng App Router (`app/`)
2. **KHÔNG dùng CSS modules** - Chỉ dùng Tailwind CSS
3. **KHÔNG install icon libraries khác** - Chỉ dùng Lucide React
4. **KHÔNG dùng axios** - Dùng native `fetch` với wrapper
5. **PHẢI dùng Server Components** khi không cần interactivity
6. **PHẢI dùng `"use client"` directive** khi cần hooks, events, browser APIs
7. **PHẢI validate ở cả frontend VÀ backend** với Zod
8. **PHẢI handle loading, error, empty states** cho mọi data fetching
9. **PHẢI dùng TypeScript strict mode**
10. **PHẢI test checkpoint trước khi chuyển phase**

## 🧪 Testing Mỗi Phase

Sau khi hoàn thành mỗi phase:
1. Chạy `pnpm turbo dev` - cả 2 app phải hoạt động
2. Test API bằng curl/Postman theo checkpoint
3. Test UI trên browser theo checkpoint
4. Không có TypeScript errors (`pnpm turbo build` pass)
5. Git commit: `git commit -m "phase-XX: <mô tả>"`
