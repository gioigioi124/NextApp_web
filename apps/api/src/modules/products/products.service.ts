import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';

type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  category?: string;
  sort?: string;
  order?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  all?: boolean | string;
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: any) {
    const slug =
      slugify(createProductDto.name, { lower: true, locale: 'vi' }) +
      '-' +
      Date.now().toString().slice(-4);

    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!category) throw new NotFoundException('Danh mục không tồn tại');
    }

    const variantsData =
      createProductDto.variants?.map((variant: any) => ({
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        image: variant.image,
        options: variant.options,
      })) || [];

    const imagesData =
      createProductDto.images?.map((url: string, index: number) => ({
        url,
        position: index,
      })) || [];

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug,
        description: createProductDto.description,
        price: createProductDto.price,
        salePrice: createProductDto.salePrice,
        stock: createProductDto.stock,
        categoryId: createProductDto.categoryId,
        sku: createProductDto.sku || 'SKU-' + Date.now().toString().slice(-6),
        isActive: createProductDto.status === 'active',
        isFeatured: Boolean(createProductDto.isFeatured),
        tags: createProductDto.tags || [],
        attributes: createProductDto.attributes || [],
        images: {
          create: imagesData,
        },
        variants: {
          create: variantsData,
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return {
      data: product,
      message: 'Product created successfully',
    };
  }

  async findAll(query: ProductQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search || '';
    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;

    const where: any = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ],
    };

    const isAll = query.all === 'true' || query.all === true || query.all === '1';
    if (!isAll) {
      where.isActive = true;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

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
        include: this.productInclude(),
        orderBy: this.buildOrderBy(query.sort, query.order),
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => this.withReviewStats(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findFeatured(limit?: number) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: this.productInclude(),
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: Number(limit) || 8,
    });

    return { data: products.map((product) => this.withReviewStats(product)) };
  }

  async searchSuggestions(query = '', limit?: number) {
    const search = query.trim();

    if (search.length < 2) {
      return { data: [] };
    }

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { category: { name: { contains: search, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        salePrice: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          select: {
            url: true,
            alt: true,
            position: true,
          },
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: Number(limit) || 6,
    });

    return { data: products };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude(),
    });

    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return { data: this.withReviewStats(product) };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        ...this.productInclude(),
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return { data: this.withReviewStats(product) };
  }

  async update(id: string, updateProductDto: any) {
    await this.findOne(id);

    const variantsData =
      updateProductDto.variants?.map((variant: any) => ({
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        image: variant.image,
        options: variant.options,
      })) || [];

    const imagesData =
      updateProductDto.images?.map((url: string, index: number) => ({
        url,
        position: index,
      })) || [];

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        salePrice: updateProductDto.salePrice,
        stock: updateProductDto.stock,
        categoryId: updateProductDto.categoryId,
        sku: updateProductDto.sku,
        isActive: updateProductDto.status === 'active',
        isFeatured: Boolean(updateProductDto.isFeatured),
        tags: updateProductDto.tags || [],
        attributes: updateProductDto.attributes || [],
        images: {
          deleteMany: {},
          create: imagesData,
        },
        variants: {
          deleteMany: {},
          create: variantsData,
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return { data: product, message: 'Cập nhật thành công' };
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        'Không thể xóa sản phẩm đã có trong đơn hàng. Vui lòng chuyển trạng thái sang Ngừng kinh doanh.'
      );
    }

    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({ where: { productId: id } }),
      this.prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      this.prisma.review.deleteMany({ where: { productId: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);

    return { message: 'Đã xóa sản phẩm' };
  }

  private productInclude() {
    return {
      category: true,
      variants: true,
      images: { orderBy: { position: 'asc' as const } },
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    };
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
