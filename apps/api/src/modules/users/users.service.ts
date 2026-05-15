import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user };
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name?.trim(),
        phone: dto.phone === undefined ? undefined : dto.phone.trim() || null,
        avatar: dto.avatar === undefined ? undefined : dto.avatar.trim() || null,
      },
      select: userSelect,
    });

    return { data: user, message: 'Profile updated successfully' };
  }

  async listAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });

    return { data: addresses };
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        fullName: dto.fullName.trim(),
        phone: dto.phone.trim(),
        street: dto.street.trim(),
        ward: dto.ward.trim(),
        district: dto.district.trim(),
        city: dto.city.trim(),
        isDefault: dto.isDefault ?? false,
      },
    });

    return { data: address, message: 'Address created successfully' };
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    await this.ensureAddress(userId, addressId);

    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    const address = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: dto.fullName?.trim(),
        phone: dto.phone?.trim(),
        street: dto.street?.trim(),
        ward: dto.ward?.trim(),
        district: dto.district?.trim(),
        city: dto.city?.trim(),
        isDefault: dto.isDefault,
      },
    });

    return { data: address, message: 'Address updated successfully' };
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.ensureAddress(userId, addressId);
    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address deleted successfully' };
  }

  private async ensureAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  private async clearDefaultAddress(userId: string) {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
