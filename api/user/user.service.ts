import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterType,
  UserPaginationResponseType,
} from './dto/user.dto';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
// import {
//   ResilienceFactory,
//   RetryOptions,
//   RetryStrategy,
//   TimeoutStrategy,
//   UseResilience,
// } from 'nestjs-resilience';

// Sử dụng UserOb là một class thay cho User là một //
// class UserOb {
//   constructor(
//     public id: number,
//     public name: string,
//     public email: string,
//   ) {}
// }

// class NullUserObject extends UserOb {
//   constructor(id: number) {
//     super(id, 'Unknown User', 'unknown@example.com');
//   }
// }

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(body: CreateUserDto): Promise<User> {
    //step1: checking email has already exist
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (user) {
      throw new HttpException(
        { message: 'This email has been used.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    //step 2: hash password and store to bd
    const hashPassword = await hash(body.password, 10);
    const result = await this.prismaService.user.create({
      data: { ...body, password: hashPassword },
    });

    return result;
  }

  async getAll(filters: UserFilterType): Promise<UserPaginationResponseType> {
    try {
      const items_per_page = Number(filters.items_per_page) || 10;
      const page = Number(filters.page) || 1;
      const search = filters.search || '';

      const skip = page > 1 ? (page - 1) * items_per_page : 0;
      const users = await this.prismaService.user.findMany({
        take: items_per_page,
        skip,
        where: {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
          ],
          AND: [
            {
              status: 1,
            },
          ],
        },
        include: {
          posts: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = await this.prismaService.user.count({
        where: {
          OR: [
            {
              name: {
                contains: search as string,
              },
            },
            {
              email: {
                contains: search as string,
              },
            },
          ],
          AND: [
            {
              status: 1,
            },
          ],
        },
      });

      return {
        data: users,
        total,
        currentPage: page,
        itemsPerPage: items_per_page,
      };
    } catch (error) {
      return error;
    }
  }

  // @UseResilience(
  //   new TimeoutStrategy(1500),
  //   ResilienceFactory.createCircuitBreakerStrategy({
  //     failureThreshold: 3, // Cho phép 3 lần thất bại trước khi mở Circuit Breaker
  //     successThreshold: 2, // Cần 2 lần thành công liên tiếp để đóng lại
  //     timeout: 500, // Thời gian chờ là 5 giây trước khi thử lại
  //   }),
  //   ResilienceFactory.createFallbackStrategy((id) => new NullUserObject(id)),
  // )
  // @UseResilience(new TimeoutStrategy(10), ResilienceFactory.createFallbackStrategy((id) => new NullUserObject(id)))
  async getDetail(id: number): Promise<User> {
    // if (id === -1) {
    //   throw new Error('Simulated error: User not found');
    // }

    // Stop 10s for testing Circuit Beaker and Fallback
    // // Hàm để dừng lại trong 10 giây
    // const delay = (ms: number) =>
    //   new Promise((resolve) => setTimeout(resolve, ms));

    // // Dừng lại 10 giây trước khi thực hiện truy vấn
    // await delay(10000); // 10000ms = 10 giây

    return this.prismaService.user.findFirst({
      where: {
        id,
      },
      include: {
        posts: true,
      },
    });

    // const retryOptions: RetryOptions = {
    //   maxRetries: 3,
    //   maxDelay: 1000,
    //   scaleFactor: 1000,
    //   retryable: (error) => {
    //     console.log(`Error encountered: ${error.message}`);
    //     return error.message.includes('Simulated error');
    //   },
    // };

    // const retryStrategy = new RetryStrategy(retryOptions); // Khởi tạo đối tượng RetryStrategy

    // try {
    //   console.log(`Requesting user detail for ID: ${id}`);

    //   return await retryStrategy.execute(async () => {
    //     if (id === -1) {
    //       throw new Error('Simulated error: User not found');
    //     }

    //     return await this.prismaService.user.findFirst({
    //       where: { id },
    //       include: { posts: true },
    //     });
    //   });
    // } catch (error) {
    //   console.error(`Failed to fetch user detail for ID: ${id}`, error);
    //   throw error;
    // }
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });
  }
}
