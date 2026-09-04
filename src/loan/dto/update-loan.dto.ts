import { PartialType } from '@nestjs/mapped-types'
import { CreateLoanDto } from './create-loan.dto.js'

export class UpdateLoanDto extends PartialType(CreateLoanDto) {}
