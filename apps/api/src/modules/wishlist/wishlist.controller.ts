import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WishlistService } from './wishlist.service';

type AuthUser = { id: string };

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: AuthUser) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post(':productId')
  addProduct(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.addProduct(user.id, productId);
  }

  @Delete(':productId')
  removeProduct(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.wishlistService.removeProduct(user.id, productId);
  }
}
