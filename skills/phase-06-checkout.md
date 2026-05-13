# Skill: Phase 6 - Đặt Hàng & Thanh Toán

> **Hoàn thành Phase 5 trước khi bắt đầu.**

---

## Mục Tiêu
Checkout multi-step, tạo đơn hàng, thanh toán COD/Stripe, mã giảm giá.

---

## BACKEND

### Orders Module
```
POST   /api/v1/orders              → Tạo đơn hàng từ cart
GET    /api/v1/orders              → Danh sách đơn hàng (user)
GET    /api/v1/orders/:id          → Chi tiết đơn hàng
POST   /api/v1/orders/:id/cancel   → Hủy đơn (nếu PENDING)
```

**Create Order flow:**
1. Validate cart không rỗng
2. Validate address tồn tại
3. Validate stock cho tất cả items
4. Validate coupon (nếu có)
5. Calculate totals (subtotal, discount, shipping, total)
6. Create order + order items (transaction)
7. Deduct stock
8. Clear cart
9. Return order with details

**Order number format:** `ORD-YYYYMMDD-XXXXX` (random 5 chars)

### Coupons Module
```
POST   /api/v1/coupons/validate    → Validate mã giảm giá (authenticated)
GET    /api/v1/admin/coupons       → List coupons (ADMIN)
POST   /api/v1/admin/coupons       → Create coupon (ADMIN)
PATCH  /api/v1/admin/coupons/:id   → Update coupon (ADMIN)
DELETE /api/v1/admin/coupons/:id   → Delete coupon (ADMIN)
```

**Validate logic:** Check code exists, isActive, date range, maxUses, minOrderValue

### Payments Module
```
POST   /api/v1/payments/create-intent   → Create Stripe PaymentIntent
POST   /api/v1/payments/webhook         → Stripe webhook
```

---

## FRONTEND

### Checkout Page (`/checkout`)
Multi-step form:

**Step 1 - Địa chỉ giao hàng:**
- Chọn từ saved addresses (radio buttons)
- Hoặc thêm địa chỉ mới (inline form)

**Step 2 - Phương thức thanh toán:**
- COD (Thanh toán khi nhận hàng)
- Card (Stripe Elements) - optional, có thể bỏ qua ban đầu

**Step 3 - Xác nhận đơn hàng:**
- Order summary: items, prices, shipping, discount, total
- Coupon code input + apply button
- Ghi chú đơn hàng (textarea)
- Nút "Đặt hàng"

**Progress bar:** 3 steps, highlighted current step

### Order Success (`/orders/[id]/success`)
- Checkmark animation
- Order number
- Order summary
- "Tiếp tục mua sắm" + "Xem đơn hàng" buttons

---

## ✅ Checkpoint

- [ ] Checkout flow 3 steps hoạt động
- [ ] Tạo đơn hàng thành công với COD
- [ ] Stock được trừ sau khi đặt hàng
- [ ] Cart được xóa sau khi đặt
- [ ] Coupon validate và apply discount
- [ ] Order success page hiển thị đúng
- [ ] Order lưu trong database với đầy đủ thông tin
