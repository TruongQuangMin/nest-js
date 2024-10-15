import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { RolesGuard } from './auth/guard/roles.guard';
// import { ValidationPipe } from '@nestjs/common';



@Module({
  imports: [AuthModule, UserModule, PostModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule { }
