import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Global Prefix ───────────────────────────────────────────
  app.setGlobalPrefix("api");

  app.enableCors({
    origin: [
      "https://qalahood.kz",
      "https://www.qalahood.kz",
      "http://localhost:5173",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-Id"],
    credentials: true,
  });

  // ─── Validation ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // убирает лишние поля
      forbidNonWhitelisted: true,
      transform: true, // автоматически приводит типы
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Swagger ─────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle("Qalahood API")
    .setDescription("Backend для платформы мерча с конструктором")
    .setVersion("1.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .addTag("auth", "Авторизация")
    .addTag("products", "Каталог товаров")
    .addTag("designs", "Дизайны вышивки")
    .addTag("cart", "Корзина")
    .addTag("orders", "Заказы")
    .addTag("upload", "Загрузка файлов")
    .addTag("admin", "Административная панель")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
