import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Design } from '../designs/entities/design.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  private readonly deliveryPrice: number;
  private readonly freeDeliveryThreshold: number;

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepo: Repository<ProductVariant>,
    @InjectRepository(Design)
    private readonly designsRepo: Repository<Design>,
    private readonly cartService: CartService,
    private readonly config: ConfigService,
  ) {
    this.deliveryPrice = Number(this.config.get('DELIVERY_PRICE', 1500));
    this.freeDeliveryThreshold = Number(this.config.get('FREE_DELIVERY_THRESHOLD', 25000));
  }

  // ─── Создать заказ ────────────────────────────────────────────
  async create(dto: CreateOrderDto, userId?: number, sessionId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Корзина пуста');
    }

    // Собираем позиции заказа и считаем суммы
    const orderItems: Partial<OrderItem>[] = [];
    let subtotal = 0;

    for (const itemDto of dto.items) {
      const variant = await this.variantsRepo.findOne({
        where: { id: itemDto.variantId },
        relations: ['product'],
      });
      if (!variant) throw new NotFoundException(`Товар id=${itemDto.variantId} не найден`);
      if (!variant.inStock) throw new BadRequestException(`Товар "${variant.colorName}" нет в наличии`);

      let design: Design | undefined = undefined;
      let designPrice = 0;
      if (itemDto.designId) {
        const foundDesign = await this.designsRepo.findOne({ where: { id: itemDto.designId } });
        if (!foundDesign) throw new NotFoundException('Дизайн не найден');
        design = foundDesign;
        designPrice = Number(design.price);
      }

      const productPrice = Number(variant.product.basePrice);
      const totalItemPrice = (productPrice + designPrice) * itemDto.quantity;
      subtotal += totalItemPrice;

      orderItems.push({
        variant,
        size: itemDto.size,
        quantity: itemDto.quantity,
        design,
        placementLocation: itemDto.placementLocation,
        productPrice,
        designPrice,
        totalItemPrice,
      });
    }

    const deliveryPrice = subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryPrice;
    const totalPrice = subtotal + deliveryPrice;

    // Создаём заказ
    const order = this.ordersRepo.create({
      ...(userId ? { user: { id: userId } as any } : {}),
      customerName: dto.customerName,
      phone: dto.phone,
      address: dto.address,
      comment: dto.comment,
      subtotal,
      deliveryPrice,
      totalPrice,
      items: orderItems as OrderItem[],
    });

    const savedOrder = await this.ordersRepo.save(order);

    // Очищаем корзину после оформления
    await this.cartService.clearCart(userId, sessionId);

    return savedOrder;
  }

  // ─── История заказов пользователя ────────────────────────────
  async findUserOrders(userId: number) {
    return this.ordersRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.variant', 'items.design'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Один заказ ──────────────────────────────────────────────
  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['items', 'items.variant', 'items.variant.product', 'items.design', 'user'],
    });
    if (!order) throw new NotFoundException('Заказ не найден');
    return order;
  }

  // ─── Admin: Все заказы ────────────────────────────────────────
  async findAll(status?: OrderStatus) {
    const where = status ? { status } : {};
    return this.ordersRepo.find({
      where,
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Admin: Обновить статус заказа ───────────────────────────
  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    return this.ordersRepo.save(order);
  }
}
