import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  findAll(position?: string) {
    return this.prisma.banner.findMany({
      where: position ? { position } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) {
      throw new NotFoundException(`Banner #${id} not found`);
    }
    return banner;
  }

  update(id: string, updateBannerDto: UpdateBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  remove(id: string) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
