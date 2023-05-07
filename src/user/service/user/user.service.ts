import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { User } from 'src/typeorm/entities/User';
import { UserI } from 'src/user/models/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  add(user: UserI): Observable<UserI> {
    return from(this.userRepository.save(user));
  }

  findAll(): Observable<UserI[]> {
    return from(this.userRepository.find());
  }
}
