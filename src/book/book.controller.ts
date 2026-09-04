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

import { Roles } from '../auth/decorators/roles.decorator.js'
import { ApiPaginatedResponse, PaginationQueryDto } from '../common/index.js'
import { UserRole } from '../user/entities/index.js'
import { BookService } from './book.service.js'
import { CreateBookDto } from './dto/create-book.dto.js'
import { UpdateBookDto } from './dto/update-book.dto.js'
import { BookResponseDto } from './dto/book-response.dto.js'

@ApiTags('books')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
@ApiBadRequestResponse({ description: 'The payload failed validation' })
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  /** Adds a book to the catalogue. */
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiCreatedResponse({ type: BookResponseDto })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiConflictResponse({ description: 'The code is already taken' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto)
  }

  /** Lists the catalogue, one page at a time. */
  @Get()
  @ApiPaginatedResponse(BookResponseDto)
  findAll(@Query() query: PaginationQueryDto) {
    return this.bookService.findAll(query)
  }

  /** Retrieves a single book. */
  @Get(':id')
  @ApiOkResponse({ type: BookResponseDto })
  @ApiNotFoundResponse({ description: 'The book does not exist' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.findOne(id)
  }

  /** Updates a book. */
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOkResponse({ type: BookResponseDto })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'The book does not exist' })
  @ApiConflictResponse({
    description:
      'The code is already taken, or the status conflicts with an open loan',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(id, updateBookDto)
  }

  /** Deletes a book. */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'The book was deleted' })
  @ApiForbiddenResponse({ description: 'Requires the admin role' })
  @ApiNotFoundResponse({ description: 'The book does not exist' })
  @ApiConflictResponse({
    description: 'The book has loans recorded against it',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.remove(id)
  }
}
