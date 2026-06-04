import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.banner.deleteMany({});

  const slides = [
    {
      title: "Giấc ngủ ngon bắt đầu từ những điều nhỏ nhẹ",
      subtitle: "Bộ sưu tập mùa Hè 2026",
      description: "Chăn ga, gối và nệm được chọn lọc cho khí hậu Việt Nam: mềm, thoáng, dễ chăm sóc và bền trong nhịp sống hằng ngày.",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=85",
      link: "/products",
      buttonText: "Khám phá ngay",
      position: "HERO",
      order: 0,
      isActive: true,
    },
    {
      title: "Cotton Sateen Cao Cấp - Nâng Niêu Từng Giấc Ngủ",
      subtitle: "Chất liệu Organic",
      description: "Trải nghiệm cảm giác mềm mại tuyệt đối với dòng sản phẩm Cotton Sateen 500TC độc quyền tại Lumina.",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1920&q=85",
      link: "/categories/bo-chan-ga",
      buttonText: "Xem bộ chăn ga",
      position: "HERO",
      order: 1,
      isActive: true,
    },
    {
      title: "Giảm Giá Đến 50% Cuối Mùa",
      subtitle: "Lumina Mid-Season Sale",
      description: "Cơ hội sở hữu những sản phẩm chăn ga gối nệm chất lượng cao với mức giá ưu đãi chưa từng có.",
      image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1920&q=85",
      link: "/products?sort=sale",
      buttonText: "Săn sale ngay",
      position: "HERO",
      order: 2,
      isActive: true,
    },
    {
      title: "Combo Làm Mới \\n Không Gian Sống",
      subtitle: "Ưu đãi mùa hè",
      description: "Chọn đồng bộ chăn, ga, gối và topper với bảng màu dịu mắt mang lại cảm giác mát mẻ trong những ngày hè. Áp dụng cho đơn combo từ 2 sản phẩm.",
      image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=85",
      link: "/promotions/combo-mua-he",
      buttonText: "Khám phá combo",
      position: "PROMOTIONAL",
      order: 0,
      isActive: true,
    }
  ];

  for (const slide of slides) {
    await prisma.banner.create({
      data: slide
    });
  }

  console.log('Successfully seeded banners');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
