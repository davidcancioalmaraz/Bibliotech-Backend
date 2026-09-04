import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  // CORS_ORIGIN takes a comma-separated list of allowed origins; unset means any
  // origin, which is fine while the API only authenticates with Bearer tokens.
  const corsOrigin = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  app.enableCors({
    origin: corsOrigin?.length ? corsOrigin : '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('BiblioTech API')
    .setDescription(
      'Library management for books and loans. Log in through `POST /api/v1/auth/login` and paste the `accessToken` into *Authorize* to call the protected endpoints.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  SwaggerModule.setup(
    'docs',
    app,
    () => SwaggerModule.createDocument(app, config),
    {
      jsonDocumentUrl: 'docs-json',
      swaggerOptions: { persistAuthorization: true },
    },
  )

  await app.listen(process.env.PORT ?? 3000)
}

await bootstrap()
