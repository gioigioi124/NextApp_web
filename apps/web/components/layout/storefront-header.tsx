"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Home,
  Loader2,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Category, Product } from "@/types/storefront";
import { formatPrice } from "shared-utils";

type StorefrontHeaderProps = {
  categories: Category[];
  suggestions?: Product[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function StorefrontHeader({ categories, suggestions = [] }: StorefrontHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartTotalItems = useCartStore((state) => state.totalItems);
  const cartChangedAt = useCartStore((state) => state.lastChangedAt);
  const openCart = useCartStore((state) => state.openCart);
  const syncWithServer = useCartStore((state) => state.syncWithServer);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const wishlistTotalItems = useWishlistStore((state) => state.totalItems);

  const popularCategories = useMemo(() => categories.slice(0, 7), [categories]);
  const instantResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return suggestions.slice(0, 5);

    return suggestions
      .filter((product) => {
        return (
          product.name.toLowerCase().includes(keyword) ||
          product.category?.name?.toLowerCase().includes(keyword)
        );
      })
      .slice(0, 5);
  }, [query, suggestions]);
  const visibleResults = results.length > 0 ? results : instantResults;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    syncWithServer().catch(() => undefined);
    fetchWishlist().catch(() => undefined);
  }, [fetchWishlist, isAuthenticated, syncWithServer]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResults() {
      const keyword = debouncedQuery.trim();

      if (keyword.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch(
          `${API_URL}/products/suggestions?q=${encodeURIComponent(keyword)}&limit=6`,
          { signal: controller.signal },
        );
        const json = await response.json();
        setResults(json.data || []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }

    loadResults();
    return () => controller.abort();
  }, [debouncedQuery]);

  const submitSearch = () => {
    const keyword = query.trim();
    if (!keyword) return;

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const openProduct = (product: Product) => {
    setOpen(false);
    router.push(`/products/${product.slug}`);
  };

  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
        Miễn phí vận chuyển cho đơn từ 500.000đ · Đổi trả trong 30 ngày
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Mở menu">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-80 max-w-[90vw]">
              <SheetHeader>
                <SheetTitle>Lumina Bedding</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 px-4">
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <Home className="size-4" />
                  Trang chủ
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <Sparkles className="size-4" />
                  Sản phẩm
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  <PackageCheck className="size-4" />
                  Don hang
                </Link>
                {popularCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex shrink-0 flex-col leading-none">
            <span className="font-heading text-xl font-bold tracking-wide text-primary">LUMINA</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Bedding
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/products" className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted">
              Sản phẩm
            </Link>
            {popularCategories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-auto hidden h-10 min-w-64 items-center gap-3 rounded-lg border border-input bg-card px-3 text-left text-sm text-muted-foreground shadow-sm transition hover:bg-muted md:flex"
          >
            <Search className="size-4" />
            <span className="flex-1">Tìm chăn ga, nệm, gối...</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">⌘K</kbd>
          </button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Tìm kiếm">
            <Search className="size-5" />
          </Button>
          <Link
            href="/wishlist"
            className="relative inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Yêu thích"
          >
            <Heart className="size-5" />
            {wishlistTotalItems > 0 ? (
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {wishlistTotalItems}
              </span>
            ) : null}
          </Link>
          <Button variant="ghost" size="icon" aria-label="Giỏ hàng" className="relative" onClick={openCart}>
            <ShoppingBag className="size-5" />
            <span
              key={cartChangedAt}
              className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white data-[active=true]:animate-bounce"
              data-active={cartChangedAt > 0}
            >
              {cartTotalItems}
            </span>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Tài khoản" render={<Link href="/profile" />}>
            <User className="size-5" />
          </Button>
        </div>

        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-border px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
          >
            Tất cả
          </Link>
          {popularCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="shrink-0 rounded-full bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-border hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </header>

      <CartDrawer />

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Tìm kiếm sản phẩm"
        description="Tìm sản phẩm Lumina"
        className="w-[calc(100vw-24px)] max-w-2xl"
      >
        <Command className="rounded-xl bg-card">
          <div className="border-b border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <CommandInput
                placeholder="Tìm chăn ga, nệm, gối..."
                value={query}
                onValueChange={setQuery}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitSearch();
                }}
              />
              {isSearching ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
              {query ? (
                <Button variant="ghost" size="icon-sm" onClick={() => setQuery("")} aria-label="Xóa tìm kiếm">
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
            {query.trim() ? (
              <button
                type="button"
                onClick={submitSearch}
                className="mt-3 flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <span>Tìm tất cả kết quả cho “{query.trim()}”</span>
                <ArrowRight className="size-4 text-primary" />
              </button>
            ) : null}
          </div>

          <CommandList className="max-h-[520px] p-2">
            <CommandEmpty>
              <div className="py-8 text-center">
                <p className="font-medium text-foreground">Không có sản phẩm phù hợp</p>
                <p className="mt-1 text-sm text-muted-foreground">Thử tìm “cotton”, “nệm” hoặc “gối”.</p>
              </div>
            </CommandEmpty>
            {visibleResults.length > 0 ? (
              <CommandGroup heading={query.trim() ? "Sản phẩm phù hợp" : "Gợi ý nổi bật"}>
                {visibleResults.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={`${product.name} ${product.slug}`}
                    onSelect={() => openProduct(product)}
                    className="gap-3 rounded-lg p-2"
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {product.category?.name || "Lumina Bedding"}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {formatPrice(Number(product.salePrice || product.price))}
                        </span>
                        {product.salePrice ? (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(Number(product.price))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            <CommandGroup heading="Danh mục phổ biến">
              {popularCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/categories/${category.slug}`);
                  }}
                  className="rounded-lg"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Sparkles className="size-4" />
                  </span>
                  <span className="font-medium">{category.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
