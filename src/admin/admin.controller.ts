// admin.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Статистика для дашборда' })
  async getDashboard() {
    const [
      totalOrders,
      newOrders,
      totalUsers,
      totalProducts,
    ] = await Promise.all([
      this.ordersRepo.count(),
      this.ordersRepo.count({ where: { status: OrderStatus.NEW } }),
      this.usersRepo.count(),
      this.productsRepo.count({ where: { isActive: true } }),
    ]);

    // Выручка за всё время
    const revenueResult = await this.ordersRepo
      .createQueryBuilder('o')
      .select('SUM(o.totalPrice)', 'total')
      .where('o.status != :status', { status: OrderStatus.CANCELLED })
      .getRawOne();

    return {
      totalOrders,
      newOrders,
      totalUsers,
      totalProducts,
      totalRevenue: Number(revenueResult.total || 0),
    };
  }
}
