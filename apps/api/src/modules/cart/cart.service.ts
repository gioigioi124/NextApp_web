import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

type CartRecord = Awaited<ReturnType<CartService['findCartRecord']>>;

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    await this.ensureCart(userId);
    const cart = await this.findCartRecord(userId);
    return { data: this.serializeCart(cart) };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.ensureCart(userId);
    const product = await this.getPurchasableProduct(dto.productId);
    const variant = this.getVariant(product, dto.variantId);
    const quantity = dto.quantity ?? 1;
    const stock = variant?.stock ?? product.stock;

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: dto.variantId ?? null,
      },
    });

    const nextQuantity = (existingItem?.quantity || 0) + quantity;
    this.assertStock(nextQuantity, stock);

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: dto.variantId ?? null,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.ensureCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: {
        product: {
          include: {
            images: { orderBy: { position: 'asc' } },
            variants: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const variant = this.getVariant(item.product, item.variantId ?? undefined);
    this.assertStock(dto.quantity, variant?.stock ?? item.product.stock);

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.ensureCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCart(userId);
  }

  async syncCart(userId: string, dto: SyncCartDto) {
    for (const item of dto.items || []) {
      await this.addItem(userId, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    return this.getCart(userId);
  }

  private async ensureCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  private async findCartRecord(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { position: 'asc' } },
                variants: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  private async getPurchasableProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: true,
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  private getVariant(product: { variants?: any[] }, variantId?: string) {
    if (!variantId) return null;

    const variant = product.variants?.find((item) => item.id === variantId);
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }

  private assertStock(quantity: number, stock: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    if (quantity > stock) {
      throw new BadRequestException('Not enough stock');
    }
  }

  private serializeCart(cart: CartRecord) {
    const items =
      cart?.items.map((item) => {
        const variant = this.getVariant(item.product, item.variantId ?? undefined);
        const productPrice = item.product.salePrice ?? item.product.price;
        const unitPrice = Number(variant?.price ?? productPrice);
        const image = variant?.image || item.product.images?.[0]?.url || null;
        const subtotal = unitPrice * item.quantity;

        return {
          id: item.id,
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: Number(item.product.price),
            salePrice: item.product.salePrice ? Number(item.product.salePrice) : null,
            image,
            stock: variant?.stock ?? item.product.stock,
          },
          variant: variant
            ? {
                id: variant.id,
                name: variant.name,
                price: Number(variant.price),
                stock: variant.stock,
                image: variant.image,
                options: variant.options,
              }
            : null,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        };
      }) || [];

    return {
      id: cart?.id || null,
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + item.subtotal, 0),
    };
  }
}
