import { Module } from '@nestjs/common'
import { LoanService } from './loan.service.js'
import { LoanController } from './loan.controller.js'

@Module({
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
