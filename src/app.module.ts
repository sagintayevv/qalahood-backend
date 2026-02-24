import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { DesignsModule } from "./designs/designs.module";
import { CartModule } from "./cart/cart.module";
import { OrdersModule } from "./orders/orders.module";
import { UploadModule } from "./upload/upload.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    // ─── Config ────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ─── Rate Limiting ─────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 минута
        limit: 100, // 100 запросов
      },
    ]),

    // ─── Database ──────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get<string>("DATABASE_URL"),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),

    // ─── Feature Modules ───────────────────────────────────────
    AuthModule,
    UsersModule,
    ProductsModule,
    DesignsModule,
    CartModule,
    OrdersModule,
    UploadModule,
    AdminModule,
  ],
})
export class AppModule {}
