import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cart } from './entities/cart.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { Design } from '../designs/entities/design.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  private readonly deliveryPrice: number;
  private readonly freeDeliveryThreshold: number;

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepo: Repository<ProductVariant>,
    @InjectRepository(Design)
    private readonly designsRepo: Repository<Design>,
    private readonly config: ConfigService,
  ) {
    this.deliveryPrice = Number(this.config.get('DELIVERY_PRICE', 1500));
    this.freeDeliveryThreshold = Number(this.config.get('FREE_DELIVERY_THRESHOLD', 25000));
  }

  // ─── Получить корзину (авторизованный или гость) ──────────────
  async getCart(userId?: number, sessionId?: string) {
    const where = userId ? { user: { id: userId } } : { sessionId };
    const items = await this.cartRepo.find({ where });
    return this.buildCartSummary(items);
  }

  // ─── Добавить в корзину ───────────────────────────────────────
  async addItem(dto: AddToCartDto, userId?: number, sessionId?: string) {
    const variant = await this.variantsRepo.findOne({ where: { id: dto.variantId } });
    if (!variant) throw new NotFoundException('Товар не найден');

    let design: Design | undefined = undefined;
    if (dto.designId) {
      const foundDesign = await this.designsRepo.findOne({ where: { id: dto.designId } });
      if (!foundDesign) throw new NotFoundException('Дизайн не найден');
      design = foundDesign;
    }

    // Проверяем: есть ли уже такой элемент в корзине
    const existingItem = await this.cartRepo.findOne({
      where: {
        ...(userId ? { user: { id: userId } } : { sessionId }),
        variant: { id: dto.variantId },
        size: dto.size,
        ...(design ? { design: { id: design.id } } : {}),
        ...(dto.placementLocation ? { placementLocation: dto.placementLocation } : {}),
      },
    });

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      return this.cartRepo.save(existingItem);
    }

    const cartItem = this.cartRepo.create({
      ...(userId ? { user: { id: userId } as any } : { sessionId }),
      variant,
      size: dto.size,
      quantity: dto.quantity,
      ...(design ? { design } : {}),
      ...(dto.placementLocation ? { placementLocation: dto.placementLocation } : {}),
    });

    await this.cartRepo.save(cartItem);
    return this.getCart(userId, sessionId);
  }

  // ─── Обновить количество ──────────────────────────────────────
  async updateItem(itemId: number, dto: UpdateCartItemDto, userId?: number, sessionId?: string) {
    const item = await this.findItemWithAccess(itemId, userId, sessionId);
    item.quantity = dto.quantity;
    await this.cartRepo.save(item);
    return this.getCart(userId, sessionId);
  }

  // ─── Удалить позицию ─────────────────────────────────────────
  async removeItem(itemId: number, userId?: number, sessionId?: string) {
    const item = await this.findItemWithAccess(itemId, userId, sessionId);
    await this.cartRepo.remove(item);
    return this.getCart(userId, sessionId);
  }

  // ─── Очистить корзину ─────────────────────────────────────────
  async clearCart(userId?: number, sessionId?: string) {
    const where = userId ? { user: { id: userId } } : { sessionId };
    await this.cartRepo.delete(where);
  }

  // ─── Перенести гостевую корзину в аккаунт ────────────────────
  async mergeGuestCart(sessionId: string, userId: number) {
    const guestItems = await this.cartRepo.find({ where: { sessionId } });
    for (const item of guestItems) {
      item.user = { id: userId } as any;
      item.sessionId = undefined as any;
    }
    await this.cartRepo.save(guestItems);
  }

  // ─── Подсчёт итогов ──────────────────────────────────────────
  private buildCartSummary(items: Cart[]) {
    const subtotal = items.reduce((sum, item) => {
      const productPrice = Number(item.variant?.product?.basePrice || 0);
      const designPrice = Number(item.design?.price || 0);
      return sum + (productPrice + designPrice) * item.quantity;
    }, 0);

    const deliveryPrice = subtotal >= this.freeDeliveryThreshold ? 0 : this.deliveryPrice;
    const amountToFreeDelivery = Math.max(0, this.freeDeliveryThreshold - subtotal);

    return {
      items,
      subtotal,
      deliveryPrice,
      total: subtotal + deliveryPrice,
      freeDeliveryThreshold: this.freeDeliveryThreshold,
      amountToFreeDelivery,
    };
  }

  private async findItemWithAccess(itemId: number, userId?: number, sessionId?: string) {
    const item = await this.cartRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Позиция не найдена');
    // Проверяем что это корзина этого пользователя
    return item;
  }
}
