import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Loan } from '../loan/entities/index.js'
import { UserService } from './user.service.js'
import { UserController } from './user.controller.js'
import { User } from './entities/index.js'

@Module({
  imports: [TypeOrmModule.forFeature([User, Loan])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
