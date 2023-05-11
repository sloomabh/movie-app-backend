import {
  HttpException,
  NotFoundException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, firstValueFrom } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/typeorm/entities/User';
import { UserI } from 'src/user/models/user.interface';
import { CreateUserDto } from 'src/user/models/dto/CreateUser.dto';
import { LoginUserDto } from 'src/user/models/dto/LoginUser.dto';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { sign } from 'jsonwebtoken';
import { ForgotPasswordDto } from 'src/user/models/dto/ForgotPasswordDto';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  create(createdUserDto: CreateUserDto): Observable<UserI> {
    const userEntity = this.userRepository.create(createdUserDto);

    return this.mailExists(userEntity.email).pipe(
      switchMap((exists: boolean) => {
        if (!exists) {
          return this.authService.hashPassword(userEntity.password).pipe(
            switchMap((passwordHash: string) => {
              // Overwrite the user password with the hash, to store it in the db
              userEntity.password = passwordHash;
              return from(this.userRepository.save(userEntity)).pipe(
                map((savedUser: UserI) => {
                  const { password, ...user } = savedUser;
                  return user;
                }),
              );
            }),
          );
        } else {
          throw new HttpException('Email already in use', HttpStatus.CONFLICT);
        }
      }),
    );
  }

  login(loginUserDto: LoginUserDto): Observable<string> {
    return this.findUserByEmail(loginUserDto.email.toLowerCase()).pipe(
      switchMap((user: UserI) => {
        if (user) {
          return this.validatePassword(
            loginUserDto.password,
            user.password,
          ).pipe(
            switchMap((passwordsMatches: boolean) => {
              if (passwordsMatches) {
                return this.findOne(user.id).pipe(
                  switchMap((user: UserI) =>
                    this.authService.generateJwt(user),
                  ),
                );
              } else {
                throw new HttpException(
                  'Login was not Successfulll',
                  HttpStatus.UNAUTHORIZED,
                );
              }
            }),
          );
        } else {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }),
    );
  }

  findOne(id: number): Observable<UserI> {
    return from(this.userRepository.findOne({ id }));
  }

  findAll(): Observable<UserI[]> {
    return from(
      this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.favorites', 'favorite')
        .leftJoinAndSelect('favorite.movie', 'movie')
        .getMany(),
    );
  }

  private findUserByEmail(email: string): Observable<UserI> {
    return from(
      this.userRepository.findOne(
        { email },
        { select: ['id', 'email', 'name', 'password'] },
      ),
    );
  }

  private validatePassword(
    password: string,
    storedPasswordHash: string,
  ): Observable<boolean> {
    return this.authService.comparePasswords(password, storedPasswordHash);
  }

  private mailExists(email: string): Observable<boolean> {
    email = email.toLowerCase();
    return from(this.userRepository.findOne({ email })).pipe(
      map((user: UserI) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      }),
    );
  }

  generateToken(user: UserI): string {
    const payload = { id: user.id, email: user.email };
    const secret = 'JWT_SECRET'; // Replace with your own secret key
    const options = { expiresIn: 'JWT_EXPIRATION_TIME' }; // Set the token expiration time as needed

    return sign(payload, secret, options);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });
    return user;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tokenpromise: Observable<string> = this.authService.generateJwt(user);
    const token: string = await firstValueFrom(tokenpromise);
    // Load the environment variables
    dotenv.config();
    const resetUrl = new URL(
      `/users/resetpassword/${token}`,
      'http://localhost:3000',
    ).toString();
    // Create a Nodemailer transporter with your mail configuration
    const transporter = nodemailer.createTransport({
      // Specify your mail service provider, host, port, etc.
      // For example, using Gmail SMTP:
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Compose the email message
    const mailOptions = {
      from: 'inboubd-platforme@gmail.com',
      to: user.email,
      subject: 'Reset Password',
      text: `Hello ${user.name},\n\nYou requested to reset your password. Please use the following link to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nYour App`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new HttpException(
          'Failed to send email',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log('Email sent:', info.response);
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.validateToken(token);
    if (!user) {
      throw new NotFoundException('Invalid or expired token');
    }

    const hashedPasswordObs = await this.authService.hashPassword(newPassword);
    let hashedPassword: string;
    hashedPasswordObs.subscribe((result) => {
      hashedPassword = result;
    });
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  private async validateToken(token: string): Promise<User | null> {
    try {
      const decodedToken = await this.authService.verifyToken(token);
      if (!decodedToken || !decodedToken.user) {
        return null;
      }

      const user = await this.userRepository.findOne(decodedToken.user.id);
      return user;
    } catch (error) {
      return null;
    }
  }
}
