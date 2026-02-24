import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

export enum ClothingCategory {
  TSHIRT = 'tshirt',       // Футболки
  HOODIE = 'hoodie',       // Худи
  LONGSLEEVE = 'longsleeve', // Лонгсливы
  SWEATSHIRT = 'sweatshirt', // Свитшоты
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // "240 GSM T-Shirt"

  @Column({ type: 'enum', enum: ClothingCategory })
  category: ClothingCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number; // цена за "голую" вещь

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isNew: boolean; // флаг "НОВИНКА" на карточке

  @Column('simple-array', { nullable: true })
  sizes: string[]; // ['S', 'M', 'L', 'XL', 'XXL']

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    eager: true,
  })
  variants: ProductVariant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
