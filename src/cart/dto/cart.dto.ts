import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlacementLocation } from '../../designs/entities/design.entity';

export class AddToCartDto {
  @ApiProperty({ example: 3, description: 'ID варианта (цвет товара)' })
  @IsNumber()
  variantId: number;

  @ApiProperty({ example: 'L' })
  @IsString()
  size: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1, required: false, description: 'ID дизайна вышивки' })
  @IsOptional()
  @IsNumber()
  designId?: number;

  @ApiProperty({ enum: PlacementLocation, required: false })
  @IsOptional()
  @IsEnum(PlacementLocation)
  placementLocation?: PlacementLocation;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
