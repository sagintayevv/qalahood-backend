import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Global Prefix ───────────────────────────────────────────
  app.setGlobalPrefix("api");

  // ─── CORS ────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://qalahood.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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

  const port = process.env.PORT || 8080;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
