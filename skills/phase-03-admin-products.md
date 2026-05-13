# Skill: Phase 3 - Quản Lý Danh Mục & Sản Phẩm (Admin)

> **Đọc `skills/conventions.md` trước. Hoàn thành Phase 2 trước khi bắt đầu.**

---

## Mục Tiêu
Admin có thể CRUD danh mục, sản phẩm, upload ảnh, quản lý biến thể sản phẩm.

---

## BACKEND (NestJS)

### Module: Categories
```
POST   /api/v1/admin/categories       → Tạo danh mục (ADMIN)
GET    /api/v1/admin/categories       → Danh sách danh mục (ADMIN)
GET    /api/v1/admin/categories/:id   → Chi tiết danh mục (ADMIN)
PATCH  /api/v1/admin/categories/:id   → Cập nhật danh mục (ADMIN)
DELETE /api/v1/admin/categories/:id   → Xóa danh mục (ADMIN)
```

**DTOs:**
```typescript
// create-category.dto.ts
export class CreateCategoryDto {
  name: string;        // Tự generate slug từ name
  description?: string;
  image?: string;
  parentId?: string;   // Danh mục cha (nếu có)
}
```

**Service logic:**
- `create`: Tự tạo slug bằng `slugify()` từ shared-utils
- `findAll`: Trả về tree structure (parent + children)
- `update`: Cho phép đổi parent, cập nhật slug khi đổi name
- `remove`: Check không có sản phẩm trước khi xóa

### Module: Products
```
POST   /api/v1/admin/products         → Tạo sản phẩm (ADMIN)
GET    /api/v1/admin/products         → Danh sách SP + pagination (ADMIN)
GET    /api/v1/admin/products/:id     → Chi tiết SP (ADMIN)
PATCH  /api/v1/admin/products/:id     → Cập nhật SP (ADMIN)
DELETE /api/v1/admin/products/:id     → Xóa SP (ADMIN)
```

**Query params cho GET list:**
```
?page=1&limit=20&sort=createdAt&order=desc&search=keyword&categoryId=xxx&isActive=true
```

**DTOs:**
```typescript
export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  images: { url: string; alt?: string; position: number }[];
  variants?: { name: string; sku: string; price: number; stock: number; options: Record<string, string> }[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}
```

### Module: Upload
```
POST   /api/v1/upload/image    → Upload single image
POST   /api/v1/upload/images   → Upload multiple images
DELETE /api/v1/upload/:filename → Xóa image
```

**Lưu ý:**
- Dùng `@nestjs/platform-express` + Multer
- Lưu vào `apps/api/uploads/` (development) hoặc S3 (production)
- Trả về URL tương đối: `/uploads/filename.webp`
- Resize ảnh bằng `sharp` package
- Max file size: 5MB, chỉ accept image/*

---

## FRONTEND (Next.js)

### Admin Layout
Tạo `apps/web/app/(admin)/layout.tsx`:
- Sidebar trái: Dashboard, Products, Categories, Orders, Users, Coupons
- Topbar: Breadcrumb, User dropdown
- Content area bên phải
- Responsive: sidebar collapse trên mobile

### Categories CRUD UI
`apps/web/app/(admin)/admin/categories/page.tsx`:
- Table với shadcn DataTable: Name, Slug, Parent, Products count, Actions
- Dialog/Sheet để Create/Edit category
- Confirm dialog khi Delete
- Image upload cho category

### Products CRUD UI
`apps/web/app/(admin)/admin/products/page.tsx`:
- Table: Image thumbnail, Name, SKU, Price, Stock, Category, Status, Actions
- Filters: Category dropdown, Status toggle, Search
- Pagination controls

`apps/web/app/(admin)/admin/products/new/page.tsx` và `[id]/edit/page.tsx`:
- Form multi-section:
  1. Basic info: name, description (rich text optional), SKU
  2. Pricing: price, sale price
  3. Inventory: stock
  4. Images: drag & drop upload, reorder, delete
  5. Category: select dropdown (tree)
  6. Variants: dynamic form add/remove
  7. Settings: isActive, isFeatured, tags

---

## ✅ Checkpoint

- [ ] Admin tạo được danh mục (có parent-child)
- [ ] Admin tạo sản phẩm với ảnh, variants
- [ ] Table hiển thị pagination, search, filter
- [ ] Upload ảnh hoạt động, hiển thị preview
- [ ] Edit/Delete sản phẩm hoạt động
- [ ] Customer KHÔNG truy cập được /admin routes
