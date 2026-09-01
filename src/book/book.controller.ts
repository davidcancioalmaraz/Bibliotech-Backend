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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'

import { BookService } from './book.service.js'
import { CreateBookDto } from './dto/create-book.dto.js'
import { UpdateBookDto } from './dto/update-book.dto.js'
import { BookResponseDto } from './dto/book-response.dto.js'

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  /** Adds a book to the catalogue. */
  @Post()
  @ApiCreatedResponse({ type: BookResponseDto })
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto)
  }

  /** Lists the whole catalogue. */
  @Get()
  @ApiOkResponse({ type: [BookResponseDto] })
  findAll() {
    return this.bookService.findAll()
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
  @ApiOkResponse({ type: BookResponseDto })
  @ApiNotFoundResponse({ description: 'The book does not exist' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(id, updateBookDto)
  }

  /** Deletes a book. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'The book was deleted' })
  @ApiNotFoundResponse({ description: 'The book does not exist' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookService.remove(id)
  }
}
