import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  UseGuards,
} from '@nestjs/common';
//import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Movie } from 'src/typeorm/entities/Movie';
import { MovieI } from 'src/movie/model/movie.interface';
import { MovieService } from 'src/movie/service/movie/movie.service';
import { Observable } from 'rxjs';
import { CreateMovieDto } from 'src/movie/model/dto/CreateMovie.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/RoleGuard';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get()
  findAll(): Observable<MovieI[]> {
    return this.movieService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number): Observable<MovieI> {
    return this.movieService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMovieDto: CreateMovieDto): Observable<MovieI> {
    return this.movieService.create(createMovieDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() movie: MovieI): Observable<MovieI> {
    return this.movieService.update(id, movie);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number): Observable<any> {
    return this.movieService.delete(id);
  }
}
