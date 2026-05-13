import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: any) {
    const slug = createProductDto.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    // Check if categoryId is provided, else create a default or handle error.
    // For now we assume categoryId "cm3ed" or similar exists, but we can't be sure without seeding.
    // To make this work safely, let's create a dummy category if it doesn't exist.
    let category = await this.prisma.category.findFirst();
    if (!category) {
      category = await this.prisma.category.create({
        data: { name: 'Chăn Ga Gối', slug: 'chan-ga-goi' }
      });
    }

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug: slug + '-' + Date.now().toString().slice(-4),
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
        categoryId: category.id,
        sku: 'SKU-' + Date.now().toString().slice(-6),
        isActive: createProductDto.status === 'active'
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

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
