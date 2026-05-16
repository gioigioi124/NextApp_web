import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async validate(code: string, subtotal: number) {
    const coupon = await this.getValidCoupon(code, subtotal);
    const discount = this.calculateDiscount(coupon, subtotal);

    return {
      data: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        discount,
      },
    };
  }

  async findAll() {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: coupons.map((coupon) => this.serializeCoupon(coupon)) };
  }

  async create(dto: CreateCouponDto) {
    this.assertDateRange(dto.startDate, dto.endDate);

    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        description: dto.description?.trim(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue,
        maxUses: dto.maxUses,
        isActive: dto.isActive ?? true,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });

    return { data: this.serializeCoupon(coupon), message: 'Coupon created successfully' };
  }

  async update(id: string, dto: UpdateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Coupon not found');
    }

    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;
    this.assertDateRange(startDate, endDate);

    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        code: dto.code ? dto.code.trim().toUpperCase() : undefined,
        description: dto.description?.trim(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue,
        maxUses: dto.maxUses,
        isActive: dto.isActive,
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    });

    return { data: this.serializeCoupon(coupon), message: 'Coupon updated successfully' };
  }

  async remove(id: string) {
    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted successfully' };
  }

  async getValidCoupon(code: string, subtotal: number, client: any = this.prisma) {
    const coupon = await client.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const now = new Date();
    if (!coupon.isActive || coupon.startDate > now || coupon.endDate < now) {
      throw new BadRequestException('Coupon is not active');
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minOrderValue !== null && subtotal < Number(coupon.minOrderValue)) {
      throw new BadRequestException('Order subtotal does not meet coupon minimum');
    }

    return coupon;
  }

  calculateDiscount(
    coupon: Awaited<ReturnType<CouponsService['getValidCoupon']>>,
    subtotal: number,
  ) {
    if (coupon.discountType === 'PERCENTAGE') {
      return Math.min(subtotal, Math.round((subtotal * Number(coupon.discountValue)) / 100));
    }

    return Math.min(subtotal, Number(coupon.discountValue));
  }

  private assertDateRange(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new BadRequestException('Coupon end date must be after start date');
    }
  }

  private serializeCoupon(coupon: any) {
    return {
      ...coupon,
      discountValue: Number(coupon.discountValue),
      minOrderValue: coupon.minOrderValue === null ? null : Number(coupon.minOrderValue),
    };
  }
}
