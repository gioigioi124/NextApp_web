import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany();
  console.log('Total images:', images.length);
  let updated = 0;
  for (const img of images) {
    if (img.url.includes('/api/v1/uploads/')) {
      const newUrl = img.url.replace('/api/v1/uploads/', '/api/v1/upload/files/');
      await prisma.productImage.update({ where: { id: img.id }, data: { url: newUrl } });
      updated++;
      console.log('Updated:', img.url, '->', newUrl);
    }
  }
  console.log('Done. Updated', updated, 'images');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
