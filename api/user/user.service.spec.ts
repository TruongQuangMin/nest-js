/* eslint-disable @typescript-eslint/no-unused-vars */
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { hash } from 'bcrypt';
import { User } from '@prisma/client'; // Assumes Prisma generates User model

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case //
  // Create
  describe('create', () => {
    it('should create a user if email does not exist', async () => {
      const mockUserDto = { email: 'test1@example.com', password: 'password', name: 'minh', phone: '0123456789', status: 1 };
      const mockUser = {
        email: 'test@example.com', password: 'password123', name: 'minh', phone: '0123456789', status: 1
      };

      (prismaService.user.findUnique as any).mockResolvedValue(null);
      (prismaService.user.create as any).mockResolvedValue(mockUser);

      const result = await userService.create(mockUserDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUserDto.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...mockUserDto, password: 'hashedPassword' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw an exception if email already exists', async () => {
      const mockUserDto = { email: 'test123@example.com', password: 'password', name: 'minh', phone: '0123456789', status: 1 };
      const mockExistingUser = {
        email: 'test@example.com', password: 'password', name: 'minh', phone: '0123456789', status: 1
      };

      (prismaService.user.findUnique as any).mockResolvedValue(mockExistingUser);

      await expect(userService.create(mockUserDto)).rejects.toThrow(
        new HttpException(
          { message: 'This email has been used.' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });


  //GetAll
  describe('getAll', () => {
    it('should return a paginated list of users', async () => {
      const filters = { items_per_page: 10, page: 1, search: '' };
      const mockUsers = [{ id: 1, name: 'John', email: 'john@example.com', status: 1 }];
      const mockCount = 1;
  
      (prismaService.user.findMany as any).mockResolvedValue(mockUsers);
      (prismaService.user.count as any).mockResolvedValue(mockCount);
  
      const result = await userService.getAll(filters);
  
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        take: filters.items_per_page,
        skip: 0,
        where: {
          OR: [
            { name: { contains: filters.search } },
            { email: { contains: filters.search } },
          ],
          AND: [{ status: 1 }],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: filters.search } },
            { email: { contains: filters.search } },
          ],
          AND: [{ status: 2 }],
        },
      });
      expect(result).toEqual({
        data: mockUsers,
        total: mockCount,
        currentPage: 1,
        itemsPerPage: 10,
      });
    });
  
    it('should handle errors gracefully', async () => {
      const filters = { items_per_page: 10, page: 1, search: '' };
        
      (prismaService.user.findMany as any).mockResolvedValue(new Error('Error fetching users'));
  
      const result = await userService.getAll(filters);
  
      expect(result).toBeInstanceOf(Object);
    });
  });
  
});
