import { Module } from '@nestjs/common';
import { MovieController } from './controller/movie/movie.controller';
import { MovieService } from './service/movie/movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from 'src/typeorm/entities/Movie';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), AuthModule],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
