import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

type AuthUser = { id: string };

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  addItem(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, id, dto);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cartService.removeItem(user.id, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: AuthUser) {
    return this.cartService.clearCart(user.id);
  }

  @Post('sync')
  syncCart(@CurrentUser() user: AuthUser, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(user.id, dto);
  }
}
