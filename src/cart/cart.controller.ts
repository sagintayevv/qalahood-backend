import {
  Controller, Get, Post, Patch, Delete, Body,
  Param, UseGuards, Request, Headers, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Корзина работает как для авторизованных, так и для гостей.
  // Гости передают X-Session-Id в заголовке (uuid генерируется на фронте).

  @Get()
  @ApiOperation({ summary: 'Получить содержимое корзины' })
  @ApiHeader({ name: 'X-Session-Id', required: false })
  getCart(
    @Request() req,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.getCart(userId, sessionId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiHeader({ name: 'X-Session-Id', required: false })
  addItem(
    @Body() dto: AddToCartDto,
    @Request() req,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.id;
    return this.cartService.addItem(dto, userId, sessionId);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Изменить количество' })
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
    @Request() req,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.updateItem(id, dto, req.user?.id, sessionId);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Удалить позицию из корзины' })
  removeItem(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.removeItem(id, req.user?.id, sessionId);
  }

  @Delete()
  @ApiOperation({ summary: 'Очистить корзину' })
  clearCart(
    @Request() req,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.cartService.clearCart(req.user?.id, sessionId);
  }

  // Вызывается после логина — переносит гостевую корзину
  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Объединить гостевую корзину с аккаунтом после логина' })
  mergeCart(
    @Request() req,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.mergeGuestCart(sessionId, req.user.id);
  }
}
