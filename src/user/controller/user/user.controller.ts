import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateUserDto } from 'src/user/models/dto/CreateUser.dto';
import { LoginUserDto } from 'src/user/models/dto/LoginUser.dto';
import { ForgotPasswordDto } from 'src/user/models/dto/ForgotPasswordDto';
import { UserI } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user/user.service';
import { Response } from 'express';
import { RoleGuard } from 'src/auth/guards/RoleGuard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  create(@Body() createdUserDto: CreateUserDto): Observable<UserI> {
    return this.userService.create(createdUserDto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginUserDto: LoginUserDto): Observable<Object> {
    return this.userService.login(loginUserDto).pipe(
      map((jwt: string) => {
        return {
          access_token: jwt,
          token_type: 'JWT',
          expires_in: 10000,
        };
      }),
    );
  }

  // Requires Valid JWT from Login Request AND THE ROLE SHOULD BE ADMIN
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  findAll(@Req() request): Observable<UserI[]> {
    console.log(request.user);
    return this.userService.findAll();
  }

  @Post('forgotpassword')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.userService.forgotPassword(forgotPasswordDto);
    res.status(200).json({ message: 'Email has been sent successfully' });
  }

  @Post('resetpassword/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
    @Res() res: any,
  ): Promise<void> {
    try {
      await this.userService.resetPassword(token, newPassword);
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
