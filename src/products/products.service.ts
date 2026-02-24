import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import {
  CreateProductDto, CreateVariantDto, ProductFilterDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepo: Repository<ProductVariant>,
  ) {}

  // ─── Каталог ─────────────────────────────────────────────────
  async findAll(filter: ProductFilterDto) {
    const query = this.productsRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .where('product.isActive = true');

    if (filter.category) {
      query.andWhere('product.category = :category', { category: filter.category });
    }
    if (filter.minPrice !== undefined) {
      query.andWhere('product.basePrice >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice !== undefined) {
      query.andWhere('product.basePrice <= :maxPrice', { maxPrice: filter.maxPrice });
    }
    if (filter.inStock) {
      query.andWhere('variant.inStock = true');
    }

    const page = filter.page || 1;
    const limit = filter.limit || 12;
    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }

  // ─── CRUD для Admin ───────────────────────────────────────────
  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepo.create(dto);
    return this.productsRepo.save(product);
  }

  async update(id: number, dto: Partial<CreateProductDto>): Promise<Product> {
    await this.productsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepo.remove(product);
  }

  // ─── Variants ────────────────────────────────────────────────
  async addVariant(productId: number, dto: CreateVariantDto): Promise<ProductVariant> {
    const product = await this.findOne(productId);
    const variant = this.variantsRepo.create({ ...dto, product });
    return this.variantsRepo.save(variant);
  }

  async updateVariant(variantId: number, dto: Partial<CreateVariantDto>): Promise<ProductVariant> {
    await this.variantsRepo.update(variantId, dto);
    const variant = await this.variantsRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Вариант не найден');
    return variant;
  }

  // ─── Для конструктора — получить все типы одежды ─────────────
  async getClothingTypes() {
    return this.productsRepo
      .createQueryBuilder('p')
      .select(['p.id', 'p.name', 'p.category', 'p.basePrice'])
      .where('p.isActive = true')
      .leftJoinAndSelect('p.variants', 'v')
      .getMany();
  }
}
