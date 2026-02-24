import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  colorName: string; // "Navy Blue", "Black", "White", "Anthracite"

  @Column({ nullable: true })
  hexCode: string; // "#1B2A6B" для цветового кружка в UI

  @Column()
  imageUrl: string; // фото пустой вещи (фронт, вид)

  @Column({ nullable: true })
  imageSideUrl: string; // фото спины

  @Column({ default: true })
  inStock: boolean;

  @Column({ default: 0 })
  stockCount: number; // количество на складе
}
