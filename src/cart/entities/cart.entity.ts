import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import { Design } from '../../designs/entities/design.entity';
import { PlacementLocation } from '../../designs/entities/design.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  // Авторизованный пользователь
  @ManyToOne(() => User, (user) => user.cartItems, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Гостевая корзина по session id
  @Column({ nullable: true })
  sessionId?: string;

  @ManyToOne(() => ProductVariant, { eager: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column()
  size: string;

  @Column({ default: 1 })
  quantity: number;

  // Кастомизация (опционально)
  @ManyToOne(() => Design, { nullable: true, eager: true })
  @JoinColumn({ name: 'design_id' })
  design?: Design;

  @Column({ type: 'enum', enum: PlacementLocation, nullable: true })
  placementLocation?: PlacementLocation;

  @CreateDateColumn()
  createdAt: Date;
}
