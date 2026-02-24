import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PlacementLocation } from '../../designs/entities/design.entity';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
  @IsNumber()
  variantId: number;

  @IsString()
  size: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  designId?: number;

  @IsOptional()
  @IsEnum(PlacementLocation)
  placementLocation?: PlacementLocation;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Алибек Джаксыбеков' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: '+77001234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'г. Алматы, ул. Абая 10, кв. 5' })
  @IsString()
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
