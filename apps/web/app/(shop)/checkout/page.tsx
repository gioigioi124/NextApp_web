"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Loader2, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
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
  { label: "Dia chi", icon: MapPin },
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
      toast.error("Vui long nhap day du thong tin địa chỉ");
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
      toast.success("Đã thêm địa chỉ giao hang");
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
      toast.success("Ma giam gia da duoc ap dung");
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
      toast.error("Vui long chon địa chỉ giao hang");
      return;
    }

    if (items.length === 0) {
      toast.error("Giỏ hàng đang trống");
      router.push("/cart");
      return;
    }

    if (paymentMethod === "CARD") {
      toast.error("Thanh toán the se duoc cau hinh o buoc Stripe sau");
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
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-secondary">Checkout</p>
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Hoàn tất đơn hàng</h1>
        </div>
        <Link
          href="/cart"
          className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted"
        >
          Quay lại giỏ hàng
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-3 overflow-hidden rounded-lg border border-border">
        {steps.map((item, index) => {
          const Icon = item.icon;
          const active = index === step;
          const done = index < step;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setStep(index)}
              className="flex min-h-16 items-center justify-center gap-2 border-r border-border px-2 text-sm font-semibold last:border-r-0 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
              data-active={active}
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-muted text-foreground data-[done=true]:bg-secondary data-[done=true]:text-secondary-foreground">
                {done ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-border bg-card p-5">
          {step === 0 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Dia chi giao hang</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chọn địa chỉ đã lưu hoặc thêm địa chỉ mới cho đơn hàng này.
                </p>
              </div>

              <div className="grid gap-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className="flex cursor-pointer gap-3 rounded-lg border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <span className="grid gap-1 text-sm">
                      <span className="font-semibold text-foreground">
                        {address.fullName} {address.isDefault ? "(mac dinh)" : ""}
                      </span>
                      <span className="text-muted-foreground">{address.phone}</span>
                      <span>
                        {address.street}, {address.ward}, {address.district}, {address.city}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="rounded-lg border border-dashed border-border p-4">
                <h3 className="font-semibold text-foreground">Thêm địa chỉ mới</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Ho va tên"
                    value={addressForm.fullName}
                    onChange={(event) =>
                      setAddressForm({ ...addressForm, fullName: event.target.value })
                    }
                  />
                  <Input
                    placeholder="So dien thoai"
                    value={addressForm.phone}
                    onChange={(event) =>
                      setAddressForm({ ...addressForm, phone: event.target.value })
                    }
                  />
                  <Input
                    className="md:col-span-2"
                    placeholder="Dia chi"
                    value={addressForm.street}
                    onChange={(event) =>
                      setAddressForm({ ...addressForm, street: event.target.value })
                    }
                  />
                  <Input
                    placeholder="Phuong/Xa"
                    value={addressForm.ward}
                    onChange={(event) => setAddressForm({ ...addressForm, ward: event.target.value })}
                  />
                  <Input
                    placeholder="Quan/Huyen"
                    value={addressForm.district}
                    onChange={(event) =>
                      setAddressForm({ ...addressForm, district: event.target.value })
                    }
                  />
                  <Input
                    placeholder="Tinh/Thanh pho"
                    value={addressForm.city}
                    onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })}
                  />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(event) =>
                        setAddressForm({ ...addressForm, isDefault: event.target.checked })
                      }
                    />
                    Dat lam địa chỉ mac dinh
                  </label>
                </div>
                <Button className="mt-4 h-10" onClick={addAddress} disabled={isSavingAddress}>
                  {isSavingAddress ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Lưu địa chỉ
                </Button>
              </div>

              <div className="flex justify-end">
                <Button className="h-10 px-5" onClick={() => setStep(1)} disabled={!selectedAddressId}>
                  Tiep tuc
                </Button>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Phuong thuc thanh toán</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  COD hoat dong ngay. Stripe Elements se duoc ket noi sau khi co key.
                </p>
              </div>

              <div className="grid gap-3">
                <label className="flex cursor-pointer gap-3 rounded-lg border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <span>
                    <span className="font-semibold text-foreground">Thanh toán khi nhan hang</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Xác nhận đơn hàng ngay va thanh toán cho don vi van chuyen.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer gap-3 rounded-lg border border-border p-4 opacity-70 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                  />
                  <span>
                    <span className="font-semibold text-foreground">The tin dung / ghi no</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Endpoint PaymentIntent da san sang, UI Stripe se cau hinh sau.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" className="h-10 px-5" onClick={() => setStep(0)}>
                  Quay lại
                </Button>
                <Button className="h-10 px-5" onClick={() => setStep(2)}>
                  Tiep tuc
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Xác nhận đơn hàng</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kiểm tra sản phẩm, địa chỉ va tổng tiền trước khi đặt hàng.
                </p>
              </div>

              {selectedAddress ? (
                <div className="rounded-lg border border-border p-4 text-sm">
                  <p className="font-semibold text-foreground">{selectedAddress.fullName}</p>
                  <p className="mt-1 text-muted-foreground">{selectedAddress.phone}</p>
                  <p className="mt-1">
                    {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district},{" "}
                    {selectedAddress.city}
                  </p>
                </div>
              ) : null}

              <div className="divide-y divide-border rounded-lg border border-border">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3">
                    <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.product.name}</p>
                      {item.variant ? (
                        <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatPrice(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="coupon">Ma giam gia</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Nhap ma"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                  />
                  <Button variant="outline" className="h-10" onClick={applyCoupon} disabled={isApplyingCoupon}>
                    {isApplyingCoupon ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Áp dụng
                  </Button>
                </div>
                {coupon ? (
                  <p className="mt-2 text-sm font-medium text-primary">
                    Da ap dung {coupon.code}: -{formatPrice(coupon.discount)}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="note">Ghi chu đơn hàng</Label>
                <Textarea
                  id="note"
                  className="mt-2"
                  placeholder="Vi du: giao gio hanh chinh"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" className="h-10 px-5" onClick={() => setStep(1)}>
                  Quay lại
                </Button>
                <Button className="h-10 px-5" onClick={submitOrder} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Dat hang
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-sm lg:sticky lg:top-32">
          <h2 className="text-lg font-semibold text-foreground">Tom tat</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tam tinh</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Van chuyen</span>
              <span className="font-medium">{shippingFee ? formatPrice(shippingFee) : "Mien phi"}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-primary">
                <span>Giảm giá</span>
                <span className="font-medium">-{formatPrice(discount)}</span>
              </div>
            ) : null}
          </div>
          <Separator className="my-5" />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Tổng cong</span>
            <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <Truck className="size-4" />
            <span>Mien phi van chuyen cho don tu 500.000d.</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
