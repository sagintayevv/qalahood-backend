// designs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design, DesignCategory } from './entities/design.entity';

export class CreateDesignDto {
  name: string;
  category: DesignCategory;
  previewUrl: string;
  dstFilename?: string;
  price: number;
  widthMm?: number;
  heightMm?: number;
}

@Injectable()
export class DesignsService {
  constructor(
    @InjectRepository(Design)
    private readonly designsRepo: Repository<Design>,
  ) {}

  async findAll(category?: DesignCategory) {
    const where: any = { isActive: true };
    if (category) where.category = category;
    return this.designsRepo.find({ where });
  }

  // Для конструктора — группируем по категориям
  async findGroupedByCategory() {
    const designs = await this.designsRepo.find({ where: { isActive: true } });
    return designs.reduce((acc, design) => {
      if (!acc[design.category]) acc[design.category] = [];
      acc[design.category].push(design);
      return acc;
    }, {} as Record<string, Design[]>);
  }

  async findOne(id: number): Promise<Design> {
    const design = await this.designsRepo.findOne({ where: { id } });
    if (!design) throw new NotFoundException('Дизайн не найден');
    return design;
  }

  async create(dto: CreateDesignDto): Promise<Design> {
    const design = this.designsRepo.create(dto);
    return this.designsRepo.save(design);
  }

  async update(id: number, dto: Partial<CreateDesignDto>): Promise<Design> {
    await this.designsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const design = await this.findOne(id);
    await this.designsRepo.remove(design);
  }
}
