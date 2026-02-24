import {
  IsString, IsNumber, IsEnum, IsBoolean, IsArray,
  IsOptional, Min, IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClothingCategory } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({ example: '240 GSM T-Shirt' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ClothingCategory })
  @IsEnum(ClothingCategory)
  category: ClothingCategory;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['S', 'M', 'L', 'XL', 'XXL'] })
  @IsArray()
  sizes: string[];

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;
}

export class CreateVariantDto {
  @ApiProperty({ example: 'Navy Blue' })
  @IsString()
  colorName: string;

  @ApiProperty({ example: '#1B2A6B', required: false })
  @IsOptional()
  @IsString()
  hexCode?: string;

  @ApiProperty({ example: 'https://cdn.qalahood.kz/navy-front.png' })
  @IsString()
  imageUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageSideUrl?: string;
}

export class ProductFilterDto {
  @ApiProperty({ enum: ClothingCategory, required: false })
  @IsOptional()
  @IsEnum(ClothingCategory)
  category?: ClothingCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, default: 12 })
  @IsOptional()
  @IsNumber()
  limit?: number = 12;
}
