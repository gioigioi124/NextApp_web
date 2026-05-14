import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categoryId = "cmp4wtj40000nth985fqeldcm"; // Dùng ID vừa tìm được
  
  const products = [];
  for (let i = 1; i <= 10; i++) {
    products.push({
      name: `Sản phẩm mẫu ${i}`,
      slug: `san-pham-mau-${i}-${Date.now()}`,
      description: `Mô tả chi tiết cho sản phẩm mẫu số ${i}. Sản phẩm chất lượng cao, bền đẹp.`,
      price: 100000 + (i * 50000),
      stock: 10 + i,
      sku: `SKU-TEST-${i}-${Math.floor(Math.random() * 1000)}`,
      categoryId: categoryId,
      isActive: true,
    });
  }

  console.log("Đang tạo 10 sản phẩm mẫu...");
  
  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        variants: {
          create: [
            {
              name: "Mặc định",
              sku: `${product.sku}-DEF`,
              price: product.price,
              stock: product.stock,
              options: {}
            }
          ]
        }
      }
    });
  }

  console.log("✅ Đã tạo xong 10 sản phẩm!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
