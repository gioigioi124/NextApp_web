"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  PackageCheck,
  Truck,
  Star,
  ArrowRight,
  Eye,
  Loader2,
  Save,
  Plus,
  Trash2
} from "lucide-react";
import type { User } from "shared-types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toast } from "sonner";
import { fetchOrders } from "@/services/order.service";
import type { Order } from "@/types/order";
import { formatPrice } from "shared-utils";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/components/order/order-status";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

const emptyAddress = {
  fullName: "",
  phone: "",
  street: "",
  ward: "",
  district: "",
  city: "",
  isDefault: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const tokens = useAuthStore((state) => state.tokens);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [profile, setProfile] = useState({ name: "", phone: "", avatar: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");
  
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    if (tokens?.accessToken) {
      apiClient.setToken(tokens.accessToken);
    }

    const loadData = async () => {
      try {
        const [userResponse, addressResponse, ordersResponse] = await Promise.all([
          apiClient.fetch<{ data: User }>("/users/me"),
          apiClient.fetch<{ data: Address[] }>("/users/me/addresses"),
          fetchOrders()
        ]);

        setUser(userResponse.data);
        setProfile({
          name: userResponse.data.name || "",
          phone: userResponse.data.phone || "",
          avatar: userResponse.data.avatar || "",
        });
        setAddresses(addressResponse.data);
        setOrders(ordersResponse.data || []);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Không thể tải hồ sơ",
        );
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, setUser, tokens?.accessToken]);

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await apiClient.fetch<{ data: User }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setUser(response.data);
      toast.success("Đã cập nhật hồ sơ");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật hồ sơ",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const addAddress = async () => {
    setIsSavingAddress(true);
    try {
      const response = await apiClient.fetch<{ data: Address }>(
        "/users/me/addresses",
        {
          method: "POST",
          body: JSON.stringify(addressForm),
        },
      );
      setAddresses((current) => [
        response.data,
        ...current.map((item) =>
          response.data.isDefault ? { ...item, isDefault: false } : item,
        ),
      ]);
      setAddressForm(emptyAddress);
      toast.success("Đã thêm địa chỉ");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể thêm địa chỉ",
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await apiClient.fetch(`/users/me/addresses/${id}`, { method: "DELETE" });
      setAddresses((current) => current.filter((item) => item.id !== id));
      toast.success("Đã xóa địa chỉ");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa địa chỉ",
      );
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.fetch("/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length;
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full space-y-2 md:w-64 md:shrink-0">
          <div className="mb-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              TÀI KHOẢN CỦA TÔI
            </p>
            <p className="truncate font-heading text-xl font-semibold text-primary">
              {profile.name || "Khách hàng"}
            </p>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "flex w-full items-center space-x-3 rounded-lg px-4 py-3 font-medium transition-all",
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <LayoutDashboard className="size-5" />
              <span>Bảng điều khiển</span>
            </button>
            <Link
              href="/orders"
              className="flex items-center space-x-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted"
            >
              <ShoppingBag className="size-5" />
              <span>Đơn hàng của tôi</span>
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center space-x-3 rounded-lg px-4 py-3 text-muted-foreground transition-all hover:bg-muted"
            >
              <Heart className="size-5" />
              <span>Danh sách yêu thích</span>
            </Link>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "flex w-full items-center space-x-3 rounded-lg px-4 py-3 font-medium transition-all",
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Settings className="size-5" />
              <span>Cài đặt tài khoản</span>
            </button>
            <div className="mt-4 border-t border-border pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-destructive transition-all hover:bg-destructive/10"
              >
                <LogOut className="size-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          {activeTab === "dashboard" ? (
            <>
              {/* Welcome Header Bento Style */}
              <section className="grid gap-6 md:grid-cols-3">
                <div className="relative flex flex-col justify-center overflow-hidden rounded-xl border border-border bg-card p-8 shadow-sm md:col-span-2">
                  <div className="relative z-10">
                    <h1 className="mb-2 font-heading text-3xl font-semibold text-primary md:text-4xl">
                      Chào mừng trở lại, {profile.name?.split(" ").pop() || "bạn"}!
                    </h1>
                    <p className="max-w-md text-muted-foreground">
                      Kiểm tra các đơn hàng mới nhất của bạn và cập nhật thông tin cá nhân để có trải nghiệm mua sắm tốt hơn.
                    </p>
                    <div className="mt-6 flex gap-4">
                      <Button className="h-11 rounded-lg px-6 shadow-md" render={<Link href="/products" />}>
                        Mua sắm ngay
                      </Button>
                      <Button variant="outline" className="h-11 rounded-lg px-6" render={<Link href="/products" />}>
                        Xem ưu đãi
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between rounded-xl border border-secondary bg-secondary p-8 text-secondary-foreground shadow-sm">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-90">
                      Điểm tích lũy
                    </p>
                    <p className="text-3xl font-bold leading-none">
                      2,450 <span className="text-sm font-normal opacity-90">Lumina Coins</span>
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-3/4 bg-white"></div>
                    </div>
                    <p className="mt-2 text-xs opacity-90">Chỉ còn 550 điểm để lên hạng Vàng</p>
                  </div>
                </div>
              </section>

              {/* Status Summary Tiles */}
              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <PackageCheck className="size-6" />
                    </div>
                    <span className="font-bold text-primary">{pendingOrders}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Đang xử lý</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                      <Truck className="size-6" />
                    </div>
                    <span className="font-bold text-emerald-600">{deliveredOrders}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Đã giao hàng</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                      <Heart className="size-6" />
                    </div>
                    <span className="font-bold text-orange-500">{wishlistItems.length}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Yêu thích</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                      <Star className="size-6" />
                    </div>
                    <span className="font-bold text-secondary">15</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Đánh giá</p>
                </div>
              </section>

              {/* Order History Table */}
              <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-card p-6">
                  <h2 className="font-heading text-2xl font-semibold text-primary">Lịch sử đơn hàng</h2>
                  <Link
                    href="/orders"
                    className="flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
                  >
                    Xem tất cả <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã đơn hàng</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày đặt</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng tiền</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.slice(0, 4).map((order) => (
                        <tr key={order.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-6 py-5 font-medium text-primary">{order.orderNumber}</td>
                          <td className="px-6 py-5 text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-semibold text-primary">
                            {formatPrice(order.total)}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Link href={`/orders/${order.id}`} className="inline-flex p-1 text-secondary transition-colors hover:text-primary">
                              <Eye className="size-5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                            Chưa có đơn hàng nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Featured Collection / Upsell */}
              <section className="relative overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground">
                <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <span className="mb-4 inline-block rounded bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground">
                      Mới ra mắt
                    </span>
                    <h2 className="mb-4 font-heading text-3xl font-semibold leading-tight md:text-4xl">
                      Bộ sưu tập Tencel Silk Cao Cấp
                    </h2>
                    <p className="mb-6 opacity-90">
                      Mang lại cảm giác mát lạnh tức thì và sự mềm mại như tơ tằm nguyên bản. Ưu đãi 15% dành riêng cho thành viên Lumina.
                    </p>
                    <Button variant="secondary" className="h-11 rounded-xl px-8 font-bold" render={<Link href="/products" />}>
                      Khám phá ngay
                    </Button>
                  </div>
                  <div className="hidden overflow-hidden rounded-xl shadow-2xl md:block">
                    <img
                      alt="Premium Bedding"
                      className="h-64 w-full object-cover"
                      src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
                    />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
              </section>
            </>
          ) : (
            <div className="grid gap-6">
              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle>Hồ sơ cá nhân</CardTitle>
                  <CardDescription>Thông tin cơ bản của tài khoản.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(event) =>
                        setProfile({ ...profile, name: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Điện thoại</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile({ ...profile, phone: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Đường dẫn ảnh đại diện</Label>
                    <Input
                      id="avatar"
                      value={profile.avatar}
                      onChange={(event) =>
                        setProfile({ ...profile, avatar: event.target.value })
                      }
                    />
                  </div>
                  <Button
                    className="h-10 w-full"
                    onClick={saveProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    Lưu hồ sơ
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle>Địa chỉ</CardTitle>
                  <CardDescription>Địa chỉ giao hàng khi thanh toán.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      placeholder="Họ và tên"
                      value={addressForm.fullName}
                      onChange={(event) =>
                        setAddressForm({
                          ...addressForm,
                          fullName: event.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Điện thoại"
                      value={addressForm.phone}
                      onChange={(event) =>
                        setAddressForm({ ...addressForm, phone: event.target.value })
                      }
                    />
                    <Input
                      className="md:col-span-2"
                      placeholder="Số nhà, tên đường"
                      value={addressForm.street}
                      onChange={(event) =>
                        setAddressForm({ ...addressForm, street: event.target.value })
                      }
                    />
                    <Input
                      placeholder="Phường/Xã"
                      value={addressForm.ward}
                      onChange={(event) =>
                        setAddressForm({ ...addressForm, ward: event.target.value })
                      }
                    />
                    <Input
                      placeholder="Quận/Huyện"
                      value={addressForm.district}
                      onChange={(event) =>
                        setAddressForm({
                          ...addressForm,
                          district: event.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Tỉnh/Thành phố"
                      value={addressForm.city}
                      onChange={(event) =>
                        setAddressForm({ ...addressForm, city: event.target.value })
                      }
                    />
                    <label className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(event) =>
                          setAddressForm({
                            ...addressForm,
                            isDefault: event.target.checked,
                          })
                        }
                      />
                      Địa chỉ mặc định
                    </label>
                  </div>
                  <Button
                    className="h-10"
                    onClick={addAddress}
                    disabled={isSavingAddress}
                  >
                    {isSavingAddress ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 size-4" />
                    )}
                    Thêm địa chỉ
                  </Button>

                  <div className="space-y-3">
                    {addresses.length === 0 ? (
                      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        Chưa có địa chỉ nào.
                      </p>
                    ) : (
                      addresses.map((address) => (
                        <div
                          key={address.id}
                          className="flex items-start justify-between gap-3 rounded-lg border p-4"
                        >
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">
                              {address.fullName}{" "}
                              {address.isDefault && (
                                <span className="text-primary">(mặc định)</span>
                              )}
                            </div>
                            <div className="text-muted-foreground">
                              {address.phone}
                            </div>
                            <div>
                              {address.street}, {address.ward}, {address.district},{" "}
                              {address.city}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteAddress(address.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
