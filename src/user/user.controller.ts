import {
  Body,
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterType,
  UserPaginationResponseType,
} from './dto/user.dto';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guard/roles.guard';
// import { JwtGuard } from 'src/auth/guard';

// @Roles(Role.ADMIN)
// @UseGuards(RolesGuard)
// @UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: CreateUserDto): Promise<User> {
    console.log('create user api=> ', body);
    return this.userService.create(body);
  }

  @Get()
  getAll(@Query() params: UserFilterType): Promise<UserPaginationResponseType> {
    console.log('get all user api', params);
    return this.userService.getAll(params);
  }

  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) id: number): Promise<User> {
    console.log('get detail user api=> ', id);
    return this.userService.getDetail(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    console.log('update user api=> ', id);
    return this.userService.update(id, data);
  }
}
