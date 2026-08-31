import { Module } from '@nestjs/common'

import { BookModule } from './book/book.module.js'

@Module({
  imports: [BookModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
