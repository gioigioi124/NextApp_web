"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, CreditCard, Loader2, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  type AddressInput,
  createAddress,
  createOrder,
  fetchAddresses,
  validateCoupon,
} from "@/services/checkout.service";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import type { Address, CouponValidation } from "@/types/order";
import { formatPrice } from "shared-utils";

const steps = [
  { label: "Địa chỉ", icon: MapPin },
  { label: "Thanh toán", icon: CreditCard },
  { label: "Xác nhận", icon: ShieldCheck },
];

const emptyAddress: AddressInput = {
  fullName: "",
  phone: "",
  street: "",
  ward: "",
  district: "",
  city: "",
  isDefault: false,
};

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const fetchServerCart = useCartStore((state) => state.fetchServerCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const openCart = useCartStore((state) => state.openCart);
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressForm, setAddressForm] = useState<AddressInput>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = totalPrice >= 500000 || totalPrice === 0 ? 0 : 35000;
  const discount = coupon?.discount || 0;
  const total = Math.max(0, totalPrice - discount + shippingFee);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    let isMounted = true;

    async function loadCheckout() {
      try {
        const [addressResponse] = await Promise.all([fetchAddresses(), fetchServerCart()]);
        if (!isMounted) return;

        setAddresses(addressResponse.data);
        setSelectedAddressId(
          addressResponse.data.find((address) => address.isDefault)?.id ||
            addressResponse.data[0]?.id ||
            "",
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load checkout");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCheckout();
    return () => {
      isMounted = false;
    };
  }, [fetchServerCart, isAuthenticated, router]);

  const addAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.street) {
      toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }

    setIsSavingAddress(true);
    try {
      const response = await createAddress(addressForm);
      setAddresses((current) => [
        response.data,
        ...current.map((item) =>
          response.data.isDefault ? { ...item, isDefault: false } : item,
        ),
      ]);
      setSelectedAddressId(response.data.id);
      setAddressForm(emptyAddress);
      toast.success("Đã thêm địa chỉ giao hàng");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    try {
      const response = await validateCoupon(code, totalPrice);
      setCoupon(response.data);
      toast.success("Mã giảm giá đã được áp dụng");
    } catch (error) {
      setCoupon(null);
      toast.error(error instanceof Error ? error.message : "Coupon is invalid");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const submitOrder = async () => {
    if (!selectedAddressId) {
      setStep(0);
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng đang trống");
      router.push("/cart");
      return;
    }

    if (paymentMethod === "CARD") {
      toast.error("Thanh toán thẻ sẽ được cấu hình ở bước Stripe sau");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: coupon?.code,
        note,
      });
      await clearCart();
      router.push(`/orders/${response.data.id}/success`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[520px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[560px] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <PackageCheck className="size-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Giỏ hàng đang trống</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thêm sản phẩm vào giỏ hàng trước khi bắt đầu thanh toán.
        </p>
        <Button className="mt-5" render={<Link href="/products" />}>
          Xem sản phẩm
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb & Title */}
      <div className="mb-12">
        <nav className="mb-4 flex items-center gap-2 text-[13px] font-semibold tracking-wider text-muted-foreground">
          <Link href="/cart" className="hover:text-primary">Giỏ hàng</Link>
          <ChevronRight className="size-4" />
          <span className="font-bold text-primary">Thanh toán</span>
        </nav>
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">Hoàn tất đơn hàng</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 md:gap-8">
        {/* Left Column: Checkout Form */}
        <div className="space-y-10 lg:col-span-7">
          {/* Section 1: Information */}
          <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">1</div>
              <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Thông tin giao hàng</h3>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className="flex cursor-pointer gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1 size-4 accent-primary"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <span className="grid gap-1 text-sm">
                      <span className="font-semibold text-foreground">
                        {address.fullName} {address.isDefault ? "(mặc định)" : ""}
                      </span>
                      <span className="text-muted-foreground">{address.phone}</span>
                      <span>
                        {address.street}, {address.ward}, {address.district}, {address.city}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              {/* Add New Address Form */}
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
                <h4 className="font-semibold text-foreground">Thêm địa chỉ mới</h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-[13px] font-semibold tracking-wider text-muted-foreground">Họ và tên</Label>
                    <Input placeholder="Nhập họ và tên" className="h-12 rounded-lg bg-card" value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-2 block text-[13px] font-semibold tracking-wider text-muted-foreground">Số điện thoại</Label>
                    <Input placeholder="0xxx xxx xxx" className="h-12 rounded-lg bg-card" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2 block text-[13px] font-semibold tracking-wider text-muted-foreground">Địa chỉ chi tiết</Label>
                    <Input placeholder="Số nhà, tên đường..." className="h-12 rounded-lg bg-card" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-2 block text-[13px] font-semibold tracking-wider text-muted-foreground">Phường / Xã</Label>
                    <Input placeholder="Phường/Xã" className="h-12 rounded-lg bg-card" value={addressForm.ward} onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-2 block text-[13px] font-semibold tracking-wider text-muted-foreground">Quận / Huyện</Label>
                    <Input placeholder="Quận/Huyện" className="h-12 rounded-lg bg-card" value={addressForm.district} onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-2 block text-[13px] font-semibold tracking-wider text-muted-foreground">Tỉnh / Thành phố</Label>
                    <Input placeholder="Tỉnh/Thành phố" className="h-12 rounded-lg bg-card" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" className="size-4 rounded border-border text-primary accent-primary" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
                    Đặt làm địa chỉ mặc định
                  </label>
                  <Button onClick={addAddress} disabled={isSavingAddress} className="h-10">
                    {isSavingAddress ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Lưu địa chỉ
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Shipping */}
          <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">2</div>
              <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Phương thức vận chuyển</h3>
            </div>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-primary bg-primary/5 p-4 transition-all">
                <div className="flex items-center gap-4">
                  <input type="radio" name="shipping" className="size-4 accent-primary" checked readOnly />
                  <div>
                    <p className="font-bold text-foreground">Giao hàng tiêu chuẩn</p>
                    <p className="text-sm text-muted-foreground">Dự kiến nhận hàng sau 2-4 ngày</p>
                  </div>
                </div>
                <span className="font-bold text-primary">{shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}</span>
              </label>
            </div>
          </section>

          {/* Section 3: Payment */}
          <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm md:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">3</div>
              <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Phương thức thanh toán</h3>
            </div>
            <div className="grid gap-4">
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="payment" className="size-4 accent-primary" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <div className="flex items-center gap-3">
                  <PackageCheck className="size-6 text-primary" />
                  <span className="font-medium text-foreground">Thanh toán khi nhận hàng (COD)</span>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="payment" className="size-4 accent-primary" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} />
                <div className="flex items-center gap-3">
                  <CreditCard className="size-6 text-secondary" />
                  <span className="font-medium text-foreground">Thẻ Quốc tế (Visa, Mastercard)</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg md:p-8">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Tóm tắt đơn hàng</h3>
                <button
                  type="button"
                  onClick={openCart}
                  className="text-sm font-semibold text-secondary hover:underline"
                >
                  Sửa đơn hàng
                </button>
              </div>
              
              {/* Item List */}
              <div className="hide-scrollbar mb-8 max-h-[400px] space-y-6 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : null}
                      <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 line-clamp-2 font-bold leading-tight text-foreground">{item.product.name}</h4>
                      {item.variant ? <p className="text-sm text-muted-foreground">{item.variant.name}</p> : null}
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} x {formatPrice(item.unitPrice)}
                        </span>
                        <span className="font-mono text-sm font-semibold text-primary">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-8 flex gap-3">
                <Input placeholder="Mã giảm giá" className="h-12 flex-1 rounded-xl bg-surface" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button className="h-12 rounded-xl px-6 font-bold" onClick={applyCoupon} disabled={isApplyingCoupon}>
                  {isApplyingCoupon ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Áp dụng
                </Button>
              </div>

              {/* Totals */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-foreground">{shippingFee ? formatPrice(shippingFee) : "Miễn phí"}</span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Giảm giá</span>
                    <span className="font-medium text-destructive">-{formatPrice(discount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="font-heading text-xl font-semibold text-foreground">Tổng cộng</span>
                  <div className="text-right">
                    <span className="block font-mono text-2xl font-bold text-primary">{formatPrice(total)}</span>
                    <span className="text-xs text-muted-foreground">(Đã bao gồm VAT)</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button className="mt-8 h-14 w-full rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" onClick={submitOrder} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 size-5 animate-spin" /> : null}
                Hoàn tất thanh toán
              </Button>
              <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-4" />
                Thanh toán an toàn & bảo mật 256-bit
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 text-center">
                <Truck className="mb-2 size-6 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Miễn phí giao hàng</span>
              </div>
              <div className="flex flex-col items-center p-3 text-center">
                <ShieldCheck className="mb-2 size-6 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cam kết chính hãng</span>
              </div>
              <div className="flex flex-col items-center p-3 text-center">
                <Check className="mb-2 size-6 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Đổi trả 30 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
