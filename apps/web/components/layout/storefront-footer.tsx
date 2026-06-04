import Link from "next/link";
import { Mail, MapPin, MessageCircle, Music2, Phone, PlayCircle } from "lucide-react";
import type { Category } from "@/types/storefront";

type StorefrontFooterProps = {
  categories: Category[];
};

export function StorefrontFooter({ categories }: StorefrontFooterProps) {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="space-y-4 md:col-span-1">
          <div>
            <p className="font-heading text-2xl font-bold tracking-wide">LUMINA</p>
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">Bedding</p>
          </div>
          <p className="text-sm leading-6 text-white/75">
            Không gian ngủ tối giản, êm ái và đáng tin cậy cho gia đình Việt.
          </p>
          <div className="flex gap-2">
            {[MessageCircle, Music2, PlayCircle].map((Icon, index) => (
              <span key={index} className="flex size-9 items-center justify-center rounded-full bg-white/10">
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Sản phẩm</h3>
          <div className="grid gap-2 text-sm text-white/75">
            <Link href="/products" className="hover:text-white">Tất cả sản phẩm</Link>
            {categories.slice(0, 5).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="hover:text-white">
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Hỗ trợ</h3>
          <div className="grid gap-2 text-sm text-white/75">
            <Link href="/pages/chinh-sach-doi-tra" className="hover:text-white">Chính sách đổi trả</Link>
            <Link href="/pages/ve-chung-toi" className="hover:text-white">Về chúng tôi</Link>
            <Link href="/pages/dieu-khoan-dich-vu" className="hover:text-white">Điều khoản dịch vụ</Link>
            <Link href="/pages/cau-hoi-thuong-gap" className="hover:text-white">Câu hỏi thường gặp</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Liên hệ</h3>
          <div className="grid gap-3 text-sm text-white/75">
            <span className="flex gap-2"><Phone className="size-4" /> 1900 2026</span>
            <span className="flex gap-2"><Mail className="size-4" /> care@lumina.vn</span>
            <span className="flex gap-2"><MapPin className="size-4" /> Quận 1, TP. Hồ Chí Minh</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © 2026 Lumina Bedding · Visa · Mastercard · MoMo · VNPay · COD
      </div>
    </footer>
  );
}
