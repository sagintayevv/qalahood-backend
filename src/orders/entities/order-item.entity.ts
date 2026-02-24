import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Design } from '../../designs/entities/design.entity';
import { PlacementLocation } from '../../designs/entities/design.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ProductVariant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column()
  size: string; // 'S', 'M', 'L', 'XL', 'XXL'

  @Column({ default: 1 })
  quantity: number;

  // Кастомизация (может быть null если просто обычная покупка)
  @ManyToOne(() => Design, { nullable: true, eager: true })
  @JoinColumn({ name: 'design_id' })
  design: Design;

  @Column({
    type: 'enum',
    enum: PlacementLocation,
    nullable: true,
  })
  placementLocation: PlacementLocation;

  // Цены на момент заказа (фиксируем, т.к. цены могут меняться)
  @Column('decimal', { precision: 10, scale: 2 })
  productPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  designPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalItemPrice: number; // (productPrice + designPrice) * quantity
}
