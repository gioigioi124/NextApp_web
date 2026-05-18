import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

type AuthUser = { id: string };

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('products/:productId/reviews')
  findByProduct(@Param('productId') productId: string, @Query() query: ListReviewsDto) {
    return this.reviewsService.findByProduct(productId, query);
  }

  @Get('products/:productId/reviews/me')
  @UseGuards(JwtAuthGuard)
  getProductReviewContext(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return this.reviewsService.getProductReviewContext(user.id, productId);
  }

  @Post('products/:productId/reviews')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: AuthUser,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.id, productId, dto);
  }

  @Get('reviews/me')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: AuthUser) {
    return this.reviewsService.findMine(user.id);
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(user.id, id, dto);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.reviewsService.remove(user.id, id);
  }
}
