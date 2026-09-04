import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module.js'
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
  providers: [],
})
export class AppModule {}
