import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/typeorm/entities/User';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const user: User = context.switchToHttp().getRequest().user;
    return user && user.role === 'admin';
  }
}
