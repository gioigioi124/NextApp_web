"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ShieldCheck, UserCog, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminUsers, updateAdminUser } from "@/services/admin.service";
import type { AdminUser } from "@/types/admin";
import { formatDate, formatPrice } from "shared-utils";

const roles = ["", "CUSTOMER", "STAFF", "ADMIN"] as const;
const roleLabels = {
  CUSTOMER: "Khách hàng",
  STAFF: "Nhân viên",
  ADMIN: "Admin",
} as const;

type Role = Exclude<(typeof roles)[number], "">;

function roleVariant(role: Role) {
  if (role === "ADMIN") return "default";
  if (role === "STAFF") return "secondary";
  return "outline";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const visibleStats = useMemo(() => {
    return {
      customers: users.filter((user) => user.role === "CUSTOMER").length,
      staff: users.filter((user) => user.role === "STAFF").length,
      admins: users.filter((user) => user.role === "ADMIN").length,
    };
  }, [users]);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      try {
        const response = await fetchAdminUsers({ page, search, role });
        if (!isMounted) return;
        setUsers(response.data);
        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages || 1);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load users");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [page, role, search]);

  const changeRole = async (userId: string, nextRole: Role) => {
    setUpdatingId(userId);
    try {
      const response = await updateAdminUser(userId, { role: nextRole });
      setUsers((current) =>
        current.map((user) => (user.id === userId ? response.data : user)),
      );
      toast.success("Đã cập nhật vai trò người dùng");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Quản trị</span>
            <span>/</span>
            <span className="font-medium text-primary">Người dùng</span>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="mt-2 text-muted-foreground">
            Tìm kiếm khach hang, theo doi gia tri mua hang va phan quyen nhan su.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Tổng <span className="font-semibold text-foreground">{total}</span> tài khoản
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Khách hàng hiển thị</span>
            <Users className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{visibleStats.customers}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nhân viên</span>
            <UserCog className="size-5 text-secondary" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{visibleStats.staff}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Admin</span>
            <ShieldCheck className="size-5 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{visibleStats.admins}</p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-9"
              placeholder="Tim email, tên hoac so dien thoai"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </div>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(event) => {
              setPage(1);
              setRole(event.target.value);
            }}
          >
            {roles.map((item) => (
              <option key={item || "all"} value={item}>
                {item ? roleLabels[item] : "Tất cả vai tro"}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            className="h-10"
            onClick={() => {
              setSearch("");
              setRole("");
              setPage(1);
            }}
          >
            Xóa loc
          </Button>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border bg-card">
        <div className="min-w-[1040px]">
          <div className="grid grid-cols-[1.25fr_130px_150px_150px_160px_140px] gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
            <span>Người dùng</span>
            <span>Vai trò</span>
            <span>Đơn hàng</span>
            <span>Đã chi</span>
            <span>Ngày tạo</span>
            <span className="text-right">Cập nhật</span>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Không có nguoi dung phu hop.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((user) => (
                <div key={user.id} className="grid grid-cols-[1.25fr_130px_150px_150px_160px_140px] items-center gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{user.name}</p>
                      {user.emailVerified ? (
                        <Badge variant="secondary" className="h-5 rounded-md">Verified</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p>
                    {user.phone ? (
                      <p className="mt-1 text-xs text-muted-foreground">{user.phone}</p>
                    ) : null}
                  </div>
                  <div>
                    <Badge variant={roleVariant(user.role)} className="h-6 rounded-md">
                      {roleLabels[user.role]}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">{user.stats.orderCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.stats.reviewCount} đánh giá - {user.stats.addressCount} địa chỉ
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(user.stats.totalSpent)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                  <div className="flex justify-end">
                    {updatingId === user.id ? (
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    ) : (
                      <select
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                        value={user.role}
                        onChange={(event) => changeRole(user.id, event.target.value as Role)}
                      >
                        {roles
                          .filter((item): item is Role => Boolean(item))
                          .map((item) => (
                            <option key={item} value={item}>
                              {roleLabels[item]}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Trang <span className="font-medium text-foreground">{page}</span> / {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            className="h-10"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
