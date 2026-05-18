import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import type { Role } from 'database';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UsersService } from './users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query() query: ListUsersDto) {
    return this.usersService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneAdmin(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.usersService.updateAdmin(id, {
      ...dto,
      role: dto.role as Role | undefined,
    });
  }
}
