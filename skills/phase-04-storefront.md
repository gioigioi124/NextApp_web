# Skill: Phase 4 - Cửa Hàng (Storefront)

> **Đọc `skills/conventions.md` trước. Hoàn thành Phase 3 trước khi bắt đầu.**

---

## Mục Tiêu
Xây dựng giao diện cửa hàng cho khách hàng: trang chủ, danh sách SP, chi tiết SP, tìm kiếm.

---

## BACKEND (NestJS)

### Public APIs (không cần auth):
```
GET /api/v1/products                → Danh sách SP (pagination, filter, search)
GET /api/v1/products/featured       → SP nổi bật
GET /api/v1/products/slug/:slug     → Chi tiết SP theo slug
GET /api/v1/categories              → Danh sách danh mục (tree)
GET /api/v1/categories/slug/:slug   → Danh mục + sản phẩm
```

**Query params:**
```
/products?page=1&limit=20&sort=price&order=asc&category=slug&minPrice=0&maxPrice=1000000&search=keyword&rating=4
```

**Response chi tiết sản phẩm:**
```json
{
  "data": {
    "id": "...",
    "name": "...",
    "slug": "...",
    "description": "...",
    "price": 500000,
    "salePrice": 450000,
    "images": [...],
    "category": { "id": "...", "name": "...", "slug": "..." },
    "variants": [...],
    "averageRating": 4.5,
    "reviewCount": 12,
    "stock": 50,
    "isActive": true
  }
}
```

---

## FRONTEND (Next.js)

### Homepage (`apps/web/app/page.tsx`)
Thiết kế premium:
1. **Hero Section**: Full-width banner/carousel, CTA button
2. **Categories Grid**: Icon + name, click vào xem SP theo category
3. **Featured Products**: Carousel hoặc grid 4 cột
4. **New Arrivals**: Grid sản phẩm mới nhất
5. **Newsletter/CTA**: Section cuối trang

### Product Card Component
`apps/web/components/product/product-card.tsx`:
- Image (hover → show second image)
- Category badge
- Product name (truncate 2 lines)
- Price (gạch giá gốc nếu có sale)
- Rating stars + review count
- Add to cart button (hover reveal)
- Wishlist heart icon

### Product Listing (`/products`)
`apps/web/app/(shop)/products/page.tsx`:
- **Sidebar filters**: Category tree, Price range slider, Rating filter
- **Product grid**: 3-4 columns, responsive
- **Sort dropdown**: Mới nhất, Giá thấp→cao, Giá cao→thấp, Bán chạy
- **Pagination**: Page numbers + Previous/Next
- **Active filters**: Chips hiển thị filter đang chọn, click X để xóa
- **Empty state**: Khi không có kết quả

### Product Detail (`/products/[slug]`)
`apps/web/app/(shop)/products/[slug]/page.tsx`:
- **Image gallery**: Main image + thumbnails, zoom on hover
- **Product info**: Name, rating, price, description
- **Variant selector**: Color/Size buttons
- **Quantity selector**: +/- buttons
- **Add to Cart / Buy Now buttons**
- **Tabs**: Description, Specifications, Reviews
- **Related Products**: Grid 4 SP cùng category

### Category Page (`/categories/[slug]`)
Tương tự product listing nhưng filter sẵn theo category.

### Search (`/search?q=`)
`apps/web/app/(shop)/search/page.tsx`:
- Search bar prominent ở đầu trang
- Results grid giống product listing
- "Tìm thấy X kết quả cho 'keyword'"
- Empty state với gợi ý

### Header Search
- Command dialog (⌘K) dùng shadcn Command component
- Autocomplete gợi ý sản phẩm khi gõ
- Debounce 300ms

---

## 🎨 Design Guidelines

- **Hero**: Gradient background hoặc image overlay, text trắng, CTA button nổi bật
- **Cards**: Shadow nhẹ, border-radius, hover scale nhẹ (1.02)
- **Price**: Giá sale màu đỏ, giá gốc gạch ngang màu xám
- **Rating**: Stars vàng (#FFC107), filled/outlined
- **Skeleton**: Dùng shadcn Skeleton cho loading states
- **Animations**: Fade-in khi scroll, hover transitions 200ms

---

## ✅ Checkpoint

- [ ] Homepage hiển thị đẹp: hero, categories, featured products
- [ ] `/products` - Grid + filters + sort + pagination hoạt động
- [ ] `/products/[slug]` - Gallery, info, variants hiển thị đúng
- [ ] Search hoạt động, autocomplete gợi ý
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Loading skeleton hiển thị khi fetch data
- [ ] Empty state khi không có kết quả
