import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = slugify(createCategoryDto.name, { lower: true });
    
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
          select: { products: true }
        },
        parent: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: categories };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        products: true
      }
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return { data: category };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const response = await this.findOne(id);
    const category = response.data;

    let slug = category.slug;
    if (updateCategoryDto.name) {
      slug = slugify(updateCategoryDto.name, { lower: true });
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
}
