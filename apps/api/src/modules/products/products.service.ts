import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: any) {
    const slug = slugify(createProductDto.name, { lower: true }) + '-' + Date.now().toString().slice(-4);
    
    // Check category existence
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: createProductDto.categoryId } });
      if (!category) throw new NotFoundException('Danh mục không tồn tại');
    }

    const variantsData = createProductDto.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      image: v.image,
      options: v.options
    })) || [];

    const imagesData = createProductDto.images?.map((url: string, index: number) => ({
      url,
      position: index,
    })) || [];

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug: slug,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        categoryId: createProductDto.categoryId,
        sku: createProductDto.sku || 'SKU-' + Date.now().toString().slice(-6),
        isActive: createProductDto.status === 'active',
        images: {
          create: imagesData
        },
        variants: {
          create: variantsData
        }
      },
      include: {
        variants: true,
        images: true
      }
    });

    return {
      data: product,
      message: "Product created successfully"
    };
  }

  async findAll(query: { page?: number; limit?: number; search?: string; categoryId?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search || '';
    const categoryId = query.categoryId;

    const where: any = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, images: true }
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return { data: product };
  }

  async update(id: string, updateProductDto: any) {
    await this.findOne(id);

    const variantsData = updateProductDto.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      image: v.image,
      options: v.options
    })) || [];

    const imagesData = updateProductDto.images?.map((url: string, index: number) => ({
      url,
      position: index,
    })) || [];

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
        categoryId: updateProductDto.categoryId,
        sku: updateProductDto.sku,
        isActive: updateProductDto.status === 'active',
        images: {
          deleteMany: {},
          create: imagesData
        },
        variants: {
          deleteMany: {},
          create: variantsData
        }
      },
      include: {
        variants: true,
        images: true
      }
    });
    return { data: product, message: "Cập nhật thành công" };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({
      where: { id }
    });
    return { message: "Đã xóa sản phẩm" };
  }
}
