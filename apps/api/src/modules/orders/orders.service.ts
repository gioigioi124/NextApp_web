import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from 'database';
import { PrismaService } from '../../prisma/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';

type PrismaTx = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const SHIPPING_FEE = 35000;
const FREE_SHIPPING_THRESHOLD = 500000;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private couponsService: CouponsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const result = await this.prisma.$transaction(
      async (tx) => {
        const address = await tx.address.findFirst({
          where: { id: dto.addressId, userId },
        });

        if (!address) {
          throw new NotFoundException('Address not found');
        }

        const cart = await tx.cart.findUnique({
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

        if (!cart || cart.items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }

        const orderItems = cart.items.map((item) => {
          if (!item.product.isActive) {
            throw new BadRequestException(`${item.product.name} is not available`);
          }

          const variant = item.variantId
            ? item.product.variants.find((entry) => entry.id === item.variantId)
            : null;
          if (item.variantId && !variant) {
            throw new BadRequestException(`${item.product.name} variant is not available`);
          }

          const stock = variant?.stock ?? item.product.stock;
          if (item.quantity > stock) {
            throw new BadRequestException(`${item.product.name} does not have enough stock`);
          }

          const productPrice = item.product.salePrice ?? item.product.price;
          const unitPrice = Number(variant?.price ?? productPrice);

          return {
            cartItemId: item.id,
            productId: item.productId,
            name: item.product.name,
            price: unitPrice,
            quantity: item.quantity,
            variantId: item.variantId,
            variant: variant
              ? {
                  id: variant.id,
                  name: variant.name,
                  sku: variant.sku,
                  options: variant.options,
                  price: Number(variant.price),
                }
              : null,
          };
        });

        const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const coupon = dto.couponCode
          ? await this.couponsService.getValidCoupon(dto.couponCode, subtotal, tx)
          : null;
        const discount = coupon ? this.couponsService.calculateDiscount(coupon, subtotal) : 0;
        const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
        const total = Math.max(0, subtotal - discount + shippingFee);

        const order = await tx.order.create({
          data: {
            orderNumber: await this.generateOrderNumber(tx),
            userId,
            addressId: address.id,
            paymentMethod: dto.paymentMethod,
            paymentStatus: dto.paymentMethod === 'COD' ? 'UNPAID' : 'UNPAID',
            subtotal,
            shippingFee,
            discount,
            total,
            note: dto.note?.trim() || null,
            items: {
              create: orderItems.map((item) => ({
                product: { connect: { id: item.productId } },
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                variant: item.variant ?? undefined,
              })),
            },
          },
          include: this.orderInclude(),
        });

        for (const item of orderItems) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order;
      },
      { timeout: 20000 },
    );

    return { data: this.serializeOrder(result), message: 'Order created successfully' };
  }

  async findAll(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: this.orderInclude(),
      orderBy: { createdAt: 'desc' },
    });

    return { data: orders.map((order) => this.serializeOrder(order)) };
  }

  async findOne(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return { data: this.serializeOrder(order) };
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: this.orderInclude(),
    });

    return { data: this.serializeOrder(updated), message: 'Order cancelled successfully' };
  }

  private async generateOrderNumber(tx: PrismaTx) {
    const date = new Date();
    const datePart = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
      const orderNumber = `ORD-${datePart}-${suffix}`;
      const existing = await tx.order.findUnique({ where: { orderNumber } });
      if (!existing) {
        return orderNumber;
      }
    }

    throw new BadRequestException('Unable to generate order number');
  }

  private orderInclude() {
    return {
      address: true,
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: 'asc' as const }, take: 1 },
            },
          },
        },
      },
    };
  }

  private serializeOrder(order: any) {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item: any) => ({
        ...item,
        price: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
        image: item.product?.images?.[0]?.url || null,
      })),
    };
  }
}
