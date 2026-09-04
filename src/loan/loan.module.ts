import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'

import { LoanController } from './loan.controller.js'
import { LoanService } from './loan.service.js'
import { Loan } from './entities/index.js'

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
