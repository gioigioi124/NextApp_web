import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    await this.ensureWishlist(userId);
    const wishlist = await this.findWishlist(userId);
    return { data: this.serializeWishlist(wishlist) };
  }

  async addProduct(userId: string, productId: string) {
    const wishlist = await this.ensureWishlist(userId);
    await this.ensureProduct(productId);

    await this.prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return this.getWishlist(userId);
  }

  async removeProduct(userId: string, productId: string) {
    const wishlist = await this.ensureWishlist(userId);
    await this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return this.getWishlist(userId);
  }

  private async ensureWishlist(userId: string) {
    return this.prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  private async ensureProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }
  }

  private async findWishlist(userId: string) {
    return this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                images: { orderBy: { position: 'asc' } },
                reviews: { select: { rating: true } },
                _count: { select: { reviews: true } },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });
  }

  private serializeWishlist(wishlist: Awaited<ReturnType<WishlistService['findWishlist']>>) {
    const items =
      wishlist?.items.map((item) => ({
        id: item.id,
        addedAt: item.addedAt,
        product: this.withReviewStats(item.product),
      })) || [];

    return {
      id: wishlist?.id || null,
      items,
      productIds: items.map((item) => item.product.id),
      totalItems: items.length,
    };
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
