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
  ApiBearerAuth,
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
import { UserRole } from './entities/index.js'
import { UserService } from './user.service.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { UserResponseDto } from './dto/user-response.dto.js'

@ApiTags('users')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
@ApiForbiddenResponse({ description: 'Requires the admin role' })
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Registers a user. The password is hashed before it is stored. */
  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  /** Lists the users, one page at a time. */
  @Get()
  @ApiPaginatedResponse(UserResponseDto)
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query)
  }

  /** Retrieves a single user. */
  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'The user does not exist' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id)
  }

  /** Updates a user. A new password is hashed like on creation. */
  @Patch(':id')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'The user does not exist' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto)
  }

  /** Deletes a user. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'The user was deleted' })
  @ApiNotFoundResponse({ description: 'The user does not exist' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id)
  }
}
