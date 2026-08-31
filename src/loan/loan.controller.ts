import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { LoanService } from './loan.service.js'
import { CreateLoanDto } from './dto/create-loan.dto.js'
import { UpdateLoanDto } from './dto/update-loan.dto.js'

@Controller('loan')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loanService.create(createLoanDto)
  }

  @Get()
  findAll() {
    return this.loanService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loanService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loanService.update(+id, updateLoanDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loanService.remove(+id)
  }
}
