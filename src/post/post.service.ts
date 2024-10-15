import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreatePostDto,
  PostFilterType,
  PostPaginationResponseType,
  UpdatePostDto,
} from './dto/post.dto';
import { Post } from '@prisma/client';
// import { ResilienceFactory } from 'nestjs-resilience';


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
export class PostService {
  constructor(private prismaService: PrismaService,
    // private readonly factory: ResilienceFactory
  ) {
  //   super([
  //     // You can use the injected factory to create a strategy
  //     factory.createTimeoutStrategy(1000),
  //     // Or you can create a strategy directly
  //     ResilienceFactory.createFallbackStrategy((id) => new NullUserObject(id))
  //     // You can also use mannually created strategies
  //     // new TimeoutStrategy(1000),
  // ]);
  }

  async create(data: CreatePostDto): Promise<Post> {
    return await this.prismaService.post.create({ data });
  }

  async getAll(filters: PostFilterType): Promise<PostPaginationResponseType> {
    const items_per_page = Number(filters.items_per_page) || 10;
    const page = Number(filters.page) || 1;
    const search = filters.search || '';
    const skip = page > 1 ? (page - 1) * items_per_page : 0;

    const posts = await this.prismaService.post.findMany({
      take: items_per_page,
      skip,
      where: {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            summary: {
              contains: search,
            },
          },
          {
            content: {
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
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await this.prismaService.post.count({
      where: {
        OR: [
          {
            title: {
              contains: search as string,
            },
          },
          {
            summary: {
              contains: search as string,
            },
          },
          {
            content: {
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
      data: posts,
      total,
      currentPage: page,
      itemsPerPage: items_per_page,
    };
  }

  async getDetail(id: number): Promise<Post> {
    return await this.prismaService.post
      .findFirst({
        where: {
          id,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
  }

  // async getDetail(id: number): Promise<Post | null> {
  //   const maxRetries = 3;
  //   let attempt = 0;
  //   let post: Post | null = null;

  //   // Logic thử lại yêu cầu nếu thất bại
  //   while (attempt < maxRetries) {
  //     try {
  //       // Thực hiện truy vấn với Prisma
  //       post = await this.prismaService.post.findFirst({
  //         where: { id },
  //         include: {
  //           owner: {
  //             select: {
  //               id: true,
  //               name: true,
  //               email: true,
  //               phone: true,
  //             },
  //           },
  //           category: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //         },
  //       });

  //       // Nếu tìm thấy post, thoát vòng lặp
  //       if (post) {
  //         return post;
  //       } else {
  //         return post;
  //       }
  //     } catch (error) {
  //       attempt++;
  //       console.error(
  //         `Failed to fetch data (attempt ${attempt}/${maxRetries}):`,
  //         error,
  //       );

  //       // Nếu đã thử hết số lần quy định, ném lỗi ra ngoài
  //       if (attempt >= maxRetries) {
  //         throw new Error('Failed to fetch data after multiple retries');
  //       }
  //     }
  //   }

  //   // Trả về null nếu không tìm thấy post hoặc có lỗi
  //   return post;
  // }

  async update(id: number, data: UpdatePostDto): Promise<Post> {
    return this.prismaService.post.update({
      where: {
        id,
      },
      data,
    });
  }
}
