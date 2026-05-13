# Skill: Phase 5 - Giỏ Hàng & Wishlist

> **Đọc `skills/conventions.md` trước. Hoàn thành Phase 4 trước khi bắt đầu.**

---

## Mục Tiêu
Giỏ hàng (server-side cho authenticated users, client-side cho guests), wishlist.

---

## BACKEND (NestJS)

### Cart Module
```
GET    /api/v1/cart           → Lấy giỏ hàng (authenticated)
POST   /api/v1/cart/items     → Thêm item vào giỏ
PATCH  /api/v1/cart/items/:id → Cập nhật số lượng
DELETE /api/v1/cart/items/:id → Xóa item
DELETE /api/v1/cart           → Xóa toàn bộ giỏ
POST   /api/v1/cart/sync      → Sync guest cart khi login
```

**Service logic:**
- Khi thêm: check stock, check item đã có → tăng quantity
- Khi update: validate quantity > 0, check stock
- Sync: nhận array items từ guest cart → merge vào server cart
- Response luôn trả về full cart với product details và calculated totals

**Cart Response:**
```json
{
  "data": {
    "id": "...",
    "items": [
      {
        "id": "...",
        "product": { "id": "...", "name": "...", "price": 500000, "image": "...", "stock": 50 },
        "quantity": 2,
        "variantId": null,
        "subtotal": 1000000
      }
    ],
    "totalItems": 2,
    "totalPrice": 1000000
  }
}
```

### Wishlist Module
```
GET    /api/v1/wishlist              → Danh sách wishlist (authenticated)
POST   /api/v1/wishlist/:productId   → Thêm vào wishlist
DELETE /api/v1/wishlist/:productId   → Xóa khỏi wishlist
```

---

## FRONTEND (Next.js)

### Cart Store (Zustand) - Guest Cart
`apps/web/stores/cart-store.ts`:
```typescript
interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variantId?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  syncWithServer: () => Promise<void>;  // Gọi khi login
}
```
- Persist với localStorage cho guests
- Khi user login → sync lên server → switch sang server cart

### Cart Drawer
`apps/web/components/cart/cart-drawer.tsx`:
- Dùng shadcn Sheet (slide from right)
- Mở khi click cart icon trên header
- Hiển thị: items list, quantity +/-, remove, subtotal
- Footer: total price, "Xem giỏ hàng", "Thanh toán"
- Empty state khi giỏ trống

### Cart Page (`/cart`)
`apps/web/app/(shop)/cart/page.tsx`:
- Table/List chi tiết hơn cart drawer
- Image, name, variant, unit price, quantity, subtotal
- Coupon code input (preview cho phase 6)
- Order summary sidebar: subtotal, shipping estimate, total
- "Tiếp tục mua hàng" + "Thanh toán" buttons

### Add to Cart Button
- Trên product card: icon button, add 1
- Trên product detail: quantity selector + "Thêm vào giỏ" button
- Toast notification khi thêm thành công
- Shake animation nếu out of stock

### Cart Badge (Header)
- Số lượng items hiển thị trên cart icon
- Animate (bounce) khi thêm item mới

### Wishlist Page (`/wishlist`)
`apps/web/app/(shop)/wishlist/page.tsx`:
- Grid sản phẩm giống product listing
- Mỗi card có nút "Thêm vào giỏ" và "Xóa khỏi wishlist"
- Empty state khi chưa có

### Wishlist Heart Icon
- Trên mỗi product card và product detail
- Filled heart nếu đã trong wishlist, outline nếu chưa
- Toggle với animation
- Yêu cầu login (redirect nếu chưa)

---

## ✅ Checkpoint

- [ ] Thêm SP vào giỏ → toast thông báo, badge cập nhật
- [ ] Cart drawer hiển thị đúng items
- [ ] Cập nhật số lượng / xóa item hoạt động
- [ ] Cart page hiển thị chi tiết
- [ ] Guest cart persist sau refresh (localStorage)
- [ ] Login → guest cart sync lên server
- [ ] Wishlist toggle hoạt động
- [ ] Wishlist page hiển thị đúng
- [ ] Out of stock → không cho thêm vào giỏ
