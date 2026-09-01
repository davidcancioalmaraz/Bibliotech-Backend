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

import { UserService } from './user.service.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { UserResponseDto } from './dto/user-response.dto.js'

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Registers a user. The password is hashed before it is stored. */
  @Post()
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  /** Lists every user. */
  @Get()
  @ApiOkResponse({ type: [UserResponseDto] })
  findAll() {
    return this.userService.findAll()
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
