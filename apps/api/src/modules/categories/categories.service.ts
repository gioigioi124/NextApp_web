import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

type CategoryProductQuery = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
};

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = slugify(createCategoryDto.name, { lower: true, locale: 'vi' });

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Danh mục này đã tồn tại');
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
        parent: true,
        children: {
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: categories };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return { data: category };
  }

  async findBySlug(slug: string, query: CategoryProductQuery) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;
    const skip = (page - 1) * limit;
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
    const childIds = category.children.map((child) => child.id);
    const where: any = {
      isActive: true,
      categoryId: { in: [category.id, ...childIds] },
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (query.rating) {
      where.reviews = { some: { rating: { gte: Number(query.rating) || 0 } } };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: { orderBy: { position: 'asc' } },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: this.buildOrderBy(query.sort, query.order),
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: {
        ...category,
        products: products.map((product) => this.withReviewStats(product)),
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const response = await this.findOne(id);
    const category = response.data;

    let slug = category.slug;
    if (updateCategoryDto.name) {
      slug = slugify(updateCategoryDto.name, { lower: true, locale: 'vi' });
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        slug,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }

  private buildOrderBy(sort?: string, order?: string): any {
    const direction = order === 'asc' ? 'asc' : 'desc';

    if (sort === 'price') {
      return { price: direction };
    }

    if (sort === 'name') {
      return { name: direction };
    }

    if (sort === 'popular') {
      return { orderItems: { _count: 'desc' } };
    }

    return { createdAt: 'desc' };
  }

  private withReviewStats(product: any) {
    const ratings = product.reviews?.map((review: any) => review.rating) || [];
    const averageRating = ratings.length
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
        ratings.length
      : 0;

    return {
      ...product,
      averageRating: Number(averageRating.toFixed(1)),
      reviewCount: product._count?.reviews || ratings.length,
    };
  }
}
