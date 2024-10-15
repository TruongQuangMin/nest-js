import { Controller, Post, Body, Query, Get, ParseIntPipe, Param, Put, UseGuards } from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';
import { PostService } from './post.service';
import { CreatePostDto, PostFilterType, PostPaginationResponseType, UpdatePostDto } from './dto/post.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';

// @Roles(Role.ADMIN)
// @UseGuards(RolesGuard)
// @UseGuards(AuthGuard)
@Controller('posts')
export class PostController {

    constructor(private postService: PostService) { }

    @Post()
    create(@Body() data: CreatePostDto): Promise<PostModel> {
        return this.postService.create(data)
    }

    @Get()
    getAll(@Query() params: PostFilterType): Promise<PostPaginationResponseType> {
        console.log("get all post => ", params)
        return this.postService.getAll(params)
    }

    @Get(':id')
    getDetail(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
        return this.postService.getDetail(id)
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdatePostDto): Promise<PostModel> {
        return this.postService.update(id, data)
    }
}
