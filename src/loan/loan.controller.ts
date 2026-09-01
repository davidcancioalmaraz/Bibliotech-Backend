import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'

import { LoanService } from './loan.service.js'
import { CreateLoanDto } from './dto/create-loan.dto.js'
import { UpdateLoanDto } from './dto/update-loan.dto.js'
import { LoanResponseDto } from './dto/loan-response.dto.js'

@ApiTags('loans')
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  /**
   * Lends an available copy: generates the loan code, derives the due date
   * from the term and moves the book to `on-loan`.
   */
  @Post()
  @ApiCreatedResponse({ type: LoanResponseDto })
  @ApiNotFoundResponse({ description: 'The book does not exist' })
  @ApiConflictResponse({ description: 'The book is not available for loan' })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loanService.create(createLoanDto)
  }

  /** Lists every loan, most recently lent first. */
  @Get()
  @ApiOkResponse({ type: [LoanResponseDto] })
  findAll() {
    return this.loanService.findAll()
  }

  /** Retrieves a single loan. */
  @Get(':id')
  @ApiOkResponse({ type: LoanResponseDto })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.findOne(id)
  }

  /** Adjusts the dates of an open loan, which is how an extension is recorded. */
  @Patch(':id')
  @ApiOkResponse({ type: LoanResponseDto })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  @ApiConflictResponse({ description: 'The loan is already returned' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loanService.update(id, updateLoanDto)
  }

  /** Closes the loan and puts the copy back on the shelf as `available`. */
  @Post(':id/return')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoanResponseDto })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  @ApiConflictResponse({ description: 'The loan is already returned' })
  return(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.return(id)
  }

  /** Deletes a loan. An open one releases its book back to `available`. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'The loan was deleted' })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.remove(id)
  }
}
