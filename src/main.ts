import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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
      'Library management for books and loans. Log in through `POST /auth/login` and paste the `accessToken` into *Authorize* to call the protected endpoints.',
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
