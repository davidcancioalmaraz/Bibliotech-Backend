import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module.js'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js'
import { RolesGuard } from './auth/guards/roles.guard.js'
import { BookModule } from './book/book.module.js'
import { LoanModule } from './loan/loan.module.js'
import { UserModule } from './user/user.module.js'
import { dataSourceOptions } from './database/data-source.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true }),
    AuthModule,
    BookModule,
    LoanModule,
    UserModule,
  ],
  controllers: [],
  // Every route is authenticated unless it is marked @Public(); JwtAuthGuard runs
  // first so that RolesGuard can read the user it puts on the request.
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
