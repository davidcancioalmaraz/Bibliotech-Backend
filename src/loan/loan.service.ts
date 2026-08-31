import { Injectable } from '@nestjs/common'
import { CreateLoanDto } from './dto/create-loan.dto.js'
import { UpdateLoanDto } from './dto/update-loan.dto.js'

@Injectable()
export class LoanService {
  create(createLoanDto: CreateLoanDto) {
    return 'This action adds a new loan'
  }

  findAll() {
    return `This action returns all loan`
  }

  findOne(id: number) {
    return `This action returns a #${id} loan`
  }

  update(id: number, updateLoanDto: UpdateLoanDto) {
    return `This action updates a #${id} loan`
  }

  remove(id: number) {
    return `This action removes a #${id} loan`
  }
}
