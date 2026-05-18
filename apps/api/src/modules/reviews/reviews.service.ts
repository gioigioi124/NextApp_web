import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: string, query: ListReviewsDto = {}) {
    await this.ensureActiveProduct(productId);

    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
    const where = {
      productId,
      ...(query.rating ? { rating: query.rating } : {}),
    };

    const [reviews, total, grouped] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: this.reviewInclude(),
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { rating: true },
      }),
    ]);

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: grouped.find((item) => item.rating === rating)?._count.rating || 0,
    }));

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        ratingDistribution,
      },
    };
  }

  async getProductReviewContext(userId: string, productId: string) {
    await this.ensureActiveProduct(productId);

    const [review, deliveredOrder] = await Promise.all([
      this.prisma.review.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        include: this.reviewInclude(),
      }),
      this.findDeliveredOrderForProduct(userId, productId),
    ]);

    return {
      data: {
        review,
        canReview: Boolean(deliveredOrder),
        orderNumber: deliveredOrder?.orderNumber || null,
      },
    };
  }

  async findMine(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      include: {
        ...this.reviewInclude(),
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { orderBy: { position: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: reviews };
  }

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    await this.ensureActiveProduct(productId);

    const existing = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const deliveredOrder = await this.findDeliveredOrderForProduct(userId, productId);
    if (!deliveredOrder) {
      throw new ForbiddenException('Only customers with delivered orders can review this product');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating: dto.rating,
        comment: dto.comment.trim(),
        images: dto.images || [],
      },
      include: this.reviewInclude(),
    });

    return { data: review, message: 'Review submitted successfully' };
  }

  async update(userId: string, id: string, dto: UpdateReviewDto) {
    await this.ensureReviewOwner(userId, id);

    const review = await this.prisma.review.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment?.trim(),
        images: dto.images,
      },
      include: this.reviewInclude(),
    });

    return { data: review, message: 'Review updated successfully' };
  }

  async remove(userId: string, id: string) {
    await this.ensureReviewOwner(userId, id);
    await this.prisma.review.delete({ where: { id } });
    return { message: 'Review deleted successfully' };
  }

  private async ensureActiveProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }
  }

  private async findDeliveredOrderForProduct(userId: string, productId: string) {
    return this.prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: { productId },
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureReviewOwner(userId: string, id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You cannot modify this review');
    }
  }

  private reviewInclude() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    };
  }
}
