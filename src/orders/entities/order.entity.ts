import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  NEW = 'new',               // новый
  PROCESSING = 'processing', // в обработке (принят в работу)
  PRODUCTION = 'production', // в производстве (шьют)
  SHIPPING = 'shipping',     // отправлен
  COMPLETED = 'completed',   // выполнен
  CANCELLED = 'cancelled',   // отменён
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // Может быть гость (без регистрации)
  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Данные для доставки
  @Column()
  customerName: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number; // сумма товаров

  @Column('decimal', { precision: 10, scale: 2, default: 1500 })
  deliveryPrice: number; // стоимость доставки

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number; // итого к оплате

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
