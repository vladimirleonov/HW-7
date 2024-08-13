import { Controller, Get, Inject } from '@nestjs/common';
import { UsersService } from '../application/users.service'
import { UsersRepository } from '../infrastructure/users.repository'
import { UserPaginationOutputType } from './models/output/get-users.output.model'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository
  ) {
    @Get()
    async getUsers() {

    }
  }
}