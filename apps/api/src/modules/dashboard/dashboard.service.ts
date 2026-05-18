import { Injectable } from '@nestjs/common';
import type { OrderStatus } from 'database';
import { PrismaService } from '../../prisma/prisma.service';

const EXCLUDED_ORDER_STATUSES: OrderStatus[] = ['CANCELLED', 'RETURNED'];
const ACTIVE_ORDER_FILTER = {
  status: {
    notIn: EXCLUDED_ORDER_STATUSES,
  },
};

type OrderForSeries = {
  createdAt: Date;
  total: unknown;
  status: string;
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const currentStart = this.startOfDay(this.addDays(now, -29));
    const previousStart = this.startOfDay(this.addDays(now, -59));
    const previousEnd = this.addDays(currentStart, -1);
    const seriesStart = this.startOfDay(this.addDays(now, -6));

    const [
      currentRevenue,
      previousRevenue,
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      pendingOrders,
      lowStockCount,
      seriesOrders,
      recentOrders,
      topProductGroups,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { ...ACTIVE_ORDER_FILTER, createdAt: { gte: currentStart } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          ...ACTIVE_ORDER_FILTER,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { createdAt: { gte: currentStart } } }),
      this.prisma.order.count({
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: currentStart } } }),
      this.prisma.user.count({
        where: { createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.product.count({ where: { isActive: true, stock: { lte: 10 } } }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: seriesStart } },
        select: { createdAt: true, total: true, status: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: ACTIVE_ORDER_FILTER },
        _sum: { quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.product.findMany({
        where: { isActive: true, stock: { lte: 10 } },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          stock: true,
          images: {
            select: { url: true },
            orderBy: { position: 'asc' },
            take: 1,
          },
        },
        orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
        take: 8,
      }),
    ]);

    const productIds = topProductGroups.map((item) => item.productId);
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            salePrice: true,
            images: {
              select: { url: true },
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        })
      : [];
    const productById = new Map(products.map((product) => [product.id, product]));

    const revenue = Number(currentRevenue._sum?.total || 0);
    const previousRevenueValue = Number(previousRevenue._sum?.total || 0);

    return {
      data: {
        metrics: {
          revenue: {
            value: revenue,
            change: this.percentChange(revenue, previousRevenueValue),
          },
          orders: {
            value: currentOrders,
            change: this.percentChange(currentOrders, previousOrders),
          },
          customers: {
            value: currentCustomers,
            change: this.percentChange(currentCustomers, previousCustomers),
          },
          averageOrderValue: {
            value: currentOrders ? Math.round(revenue / currentOrders) : 0,
            change: null,
          },
          pendingOrders,
          lowStockCount,
        },
        salesSeries: this.buildSalesSeries(seriesOrders, seriesStart),
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: Number(order.total),
          createdAt: order.createdAt,
          itemCount: order._count.items,
          user: order.user,
        })),
        topProducts: topProductGroups.map((item) => {
          const product = productById.get(item.productId);
          return {
            productId: item.productId,
            name: product?.name || 'Unknown product',
            slug: product?.slug || null,
            sku: product?.sku || null,
            image: product?.images[0]?.url || null,
            price: Number(product?.salePrice || product?.price || 0),
            quantitySold: item._sum?.quantity || 0,
            orderCount: typeof item._count === 'object' ? item._count._all || 0 : 0,
          };
        }),
        lowStockProducts: lowStockProducts.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          stock: product.stock,
          image: product.images[0]?.url || null,
        })),
      },
    };
  }

  private buildSalesSeries(orders: OrderForSeries[], start: Date) {
    const rows = Array.from({ length: 7 }, (_, index) => {
      const date = this.addDays(start, index);
      return {
        date: this.toDateKey(date),
        label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: 0,
        orders: 0,
      };
    });
    const rowByDate = new Map(rows.map((row) => [row.date, row]));

    orders.forEach((order) => {
      const row = rowByDate.get(this.toDateKey(order.createdAt));
      if (!row) return;
      row.orders += 1;
      if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
        row.revenue += Number(order.total);
      }
    });

    return rows;
  }

  private percentChange(current: number, previous: number) {
    if (!previous) {
      return current ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  private startOfDay(date: Date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private toDateKey(date: Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
