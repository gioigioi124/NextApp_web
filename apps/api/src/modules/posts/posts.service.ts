import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostType, PostStatus } from 'database';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: userId,
        publishedAt: createPostDto.status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async findAll(type?: PostType, status?: PostStatus) {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    return this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async findOne(idOrSlug: string) {
    const post = await this.prisma.post.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const data: any = { ...updatePostDto };
    const dtoStatus = (updatePostDto as any).status;
    
    // Update publishedAt if status changes to PUBLISHED
    if (dtoStatus === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED) {
      data.publishedAt = new Date();
    } else if (dtoStatus === PostStatus.DRAFT || dtoStatus === PostStatus.ARCHIVED) {
      data.publishedAt = null;
    }

    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
