// upload.controller.ts
import {
  Controller, Post, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { memoryStorage } from 'multer';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('product-image')
  @ApiOperation({ summary: '[Admin] Загрузить фото товара' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не выбран');
    return this.uploadService.uploadImage(file, 'products');
  }

  @Post('design-preview')
  @ApiOperation({ summary: '[Admin] Загрузить превью дизайна (PNG для сайта)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadDesignPreview(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не выбран');
    return this.uploadService.uploadImage(file, 'designs');
  }

  @Post('design-dst')
  @ApiOperation({ summary: '[Admin] Загрузить .dst файл вышивки (для швейной машины)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadDstFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не выбран');
    return this.uploadService.uploadDstFile(file);
  }
}
