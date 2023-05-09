import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/typeorm/entities/User';
import { UserI } from 'src/user/models/user.interface';
import { CreateUserDto } from 'src/user/models/dto/CreateUser.dto';
import { LoginUserDto } from 'src/user/models/dto/LoginUser.dto';
import { AuthService } from 'src/auth/services/auth/auth.service';

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

  login(loginUserDto: LoginUserDto): Observable<any> {
    return this.findUserByEmail(loginUserDto.email).pipe(
      switchMap((user: UserI) => {
        if (user) {
          return this.validatePassword(
            loginUserDto.password,
            user.password,
          ).pipe(
            map((passwordsMatches: boolean) => {
              if (passwordsMatches) {
                this.findOne(user.id).pipe(
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
    return from(this.userRepository.find());
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
}
