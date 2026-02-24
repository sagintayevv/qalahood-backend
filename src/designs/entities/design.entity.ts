import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn,
} from 'typeorm';

export enum DesignCategory {
  CITIES = 'cities',           // Города
  ANIME = 'anime',             // Аниме
  FOOTBALL = 'football',       // Футбол
  BASKETBALL = 'basketball',   // Баскетбол
  COUNTRIES = 'countries',     // Страны
}

export enum PlacementLocation {
  CHEST = 'chest',     // Грудь
  BACK = 'back',       // Спина
  HEART = 'heart',     // Сердце (левая грудь)
}

@Entity('designs')
export class Design {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // "Aqtau", "Aqtobe"

  @Column({ type: 'enum', enum: DesignCategory })
  category: DesignCategory;

  @Column()
  previewUrl: string; // PNG картинка для клиента (сайт)

  @Column({ nullable: true })
  dstFilename: string; // имя .dst файла для швейной машины (только для админа)

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // стоимость нанесения вышивки

  @Column({ nullable: true })
  widthMm: number; // реальная ширина вышивки в мм

  @Column({ nullable: true })
  heightMm: number; // реальная высота вышивки в мм

  // На каких типах одежды доступен этот дизайн
  @Column('simple-array', { nullable: true })
  compatiblePlacements: PlacementLocation[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
