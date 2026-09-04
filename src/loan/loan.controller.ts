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
  Query,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import type { AuthenticatedUser } from '../auth/types/jwt-payload.js'
import { ApiPaginatedResponse, PaginationQueryDto } from '../common/index.js'
import { UserRole } from '../user/entities/index.js'
import { LoanService } from './loan.service.js'
import { CreateLoanDto } from './dto/create-loan.dto.js'
import { UpdateLoanDto } from './dto/update-loan.dto.js'
import { LoanResponseDto } from './dto/loan-response.dto.js'

@ApiTags('loans')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
@ApiBadRequestResponse({ description: 'The payload failed validation' })
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  /**
   * Lends an available copy to a user: generates the loan code, derives the due
   * date from the term and moves the book to `on-loan`.
   */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: LoanResponseDto })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'The book or the user does not exist' })
  @ApiBadRequestResponse({
    description: '`loanedAt` is not a past `YYYY-MM-DD` date',
  })
  @ApiConflictResponse({
    description: 'The book is not available for loan, or the user is inactive',
  })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loanService.create(createLoanDto)
  }

  /** Lists the loans, most recently lent first, one page at a time. */
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiPaginatedResponse(LoanResponseDto)
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.loanService.findAll(query)
  }

  /** Lists the current user's open loans, most recently lent first. */
  @Get('me')
  @ApiPaginatedResponse(LoanResponseDto)
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.loanService.findMine(user.id, query)
  }

  /** Retrieves a single loan. */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: LoanResponseDto })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.findOne(id)
  }

  /** Adjusts the dates of an open loan, which is how an extension is recorded. */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: LoanResponseDto })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  @ApiBadRequestResponse({
    description: '`loanedAt` is not a past `YYYY-MM-DD` date',
  })
  @ApiConflictResponse({ description: 'The loan is already returned' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loanService.update(id, updateLoanDto)
  }

  /** Closes the loan and puts the copy back on the shelf as `available`. */
  @Post(':id/return')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoanResponseDto })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  @ApiConflictResponse({ description: 'The loan is already returned' })
  return(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.return(id)
  }

  /** Deletes a loan. An open one releases its book back to `available`. */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'The loan was deleted' })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'The loan does not exist' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loanService.remove(id)
  }
}
