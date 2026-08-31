import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BookModule } from './book/book.module.js'
import { LoanModule } from './loan/loan.module.js'
import { dataSourceOptions } from './database/data-source.js'

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true }),
    BookModule,
    LoanModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
