import {
  Controller, Get, Post, Patch, Delete, Body,
  Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DesignsService, CreateDesignDto } from './designs.service';
import { DesignCategory } from './entities/design.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('designs')
@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Get()
  @ApiOperation({ summary: 'Все дизайны (опционально фильтр по категории)' })
  findAll(@Query('category') category?: DesignCategory) {
    return this.designsService.findAll(category);
  }

  @Get('grouped')
  @ApiOperation({ summary: 'Дизайны сгруппированные по категориям (для конструктора)' })
  findGrouped() {
    return this.designsService.findGroupedByCategory();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.designsService.findOne(id);
  }

  // ─── Admin Only ───────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Добавить дизайн вышивки' })
  create(@Body() dto: CreateDesignDto) {
    return this.designsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Обновить дизайн' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateDesignDto>) {
    return this.designsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '[Admin] Удалить дизайн' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.designsService.remove(id);
  }
}
