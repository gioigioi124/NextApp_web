import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPromotionDto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: createPromotionDto,
    });
  }

  async findAll() {
    return this.prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion not found`);
    }
    return promotion;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Promotion not found`);
    }

    return this.prisma.promotion.update({
      where: { id },
      data: updatePromotionDto,
    });
  }

  async remove(id: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Promotion not found`);
    }
    return this.prisma.promotion.delete({
      where: { id },
    });
  }
}
