import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3: AWS.S3;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new AWS.S3({
      region: config.get('AWS_REGION'),
      accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
    });
    this.bucket = config.get<string>('AWS_S3_BUCKET') ?? '';
  }

  // Загружает изображение товара / дизайна
  async uploadImage(file: Express.Multer.File, folder: 'products' | 'designs'): Promise<string> {
    this.validateImage(file);

    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }).promise();

    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  // Загружает .dst файл вышивки (только для admin)
  async uploadDstFile(file: Express.Multer.File): Promise<string> {
    if (!file.originalname.toLowerCase().endsWith('.dst')) {
      throw new BadRequestException('Принимаются только файлы .dst (формат вышивки)');
    }

    const key = `embroidery/${uuidv4()}_${file.originalname}`;
    await this.s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: 'application/octet-stream',
      // DST файлы — приватные (только для машины)
    }).promise();

    return file.originalname; // возвращаем только имя файла
  }

  private validateImage(file: Express.Multer.File) {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Допустимые форматы: JPEG, PNG, WebP');
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Файл слишком большой (максимум 5MB)');
    }
  }
}
