import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'api/prisma.service';
import { RegisterDto } from './dtos/auth.dtos';
import { User } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  register = async (userData: RegisterDto): Promise<User> => {
    //step 1: checking email has already used
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (user) {
      throw new HttpException(
        { message: 'This email has been used.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    //step 2: hash password and store to db

    const hashPassword = await hash(userData.password, 10);

    const res = await this.prismaService.user.create({
      data: { ...userData, password: hashPassword},
    });

    return res;
  };

  login = async (data: { email: string; password: string }): Promise<any> => {
    //step 1: checking user is exist by email

    const user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw new HttpException(
        { message: 'Account is not exist.' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    //step 2: check password
    const verify = await compare(data.password, user.password);

    if (!verify) {
      throw new HttpException(
        { message: 'Password doese not correct.' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    //step 3: generate access token and refresh token
    const payload = { id: user.id, name: user.name, email: user.email, nameRole: user.roleName};
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  };


  // async logout(user: User) {
  //   await this.userService.update(
  //     { email: user.email },
  //     { refreshToken: null },
  //   );
  // }
}
