import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: any) {
    const slug = createProductDto.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    let category = await this.prisma.category.findFirst();
    if (!category) {
      category = await this.prisma.category.create({
        data: { name: 'Chăn Ga Gối', slug: 'chan-ga-goi' }
      });
    }

    const variantsData = createProductDto.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      options: v.options
    })) || [];

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug: slug + '-' + Date.now().toString().slice(-4),
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        categoryId: category.id,
        sku: 'SKU-' + Date.now().toString().slice(-6),
        isActive: createProductDto.status === 'active',
        variants: {
          create: variantsData
        }
      },
      include: {
        variants: true
      }
    });

    return {
      data: product,
      message: "Product created successfully"
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      data: products,
      meta: {
        total: products.length,
        page: 1,
        limit: products.length,
        totalPages: 1
      }
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true, images: true }
    });
    return { data: product };
  }

  async update(id: string, updateProductDto: any) {
    const variantsData = updateProductDto.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      options: v.options
    })) || [];

    // Cập nhật sản phẩm cơ bản và ghi đè toàn bộ biến thể
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
        categoryId: updateProductDto.categoryId,
        isActive: updateProductDto.status === 'active',
        variants: {
          deleteMany: {},
          create: variantsData
        }
      },
      include: {
        variants: true
      }
    });
    return { data: product, message: "Cập nhật thành công" };
  }

  async remove(id: string) {
    // Delete product.
    await this.prisma.product.delete({
      where: { id }
    });
    return { message: "Đã xóa sản phẩm" };
  }
}
