import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Movie } from 'src/typeorm/entities/Movie';
import { MovieI } from 'src/movie/model/movie.interface';
import { switchMap } from 'rxjs/operators';
import { CreateMovieDto } from 'src/movie/model/dto/CreateMovie.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  findAll(): Observable<MovieI[]> {
    return from(this.movieRepository.find());
  }

  findOne(id: number): Observable<MovieI> {
    return from(this.movieRepository.findOne(id));
  }

  create(createMovieDto: CreateMovieDto): Observable<MovieI> {
    const movie: Movie = new Movie();
    movie.title = createMovieDto.title;
    movie.director = createMovieDto.director;
    movie.yearReleased = +createMovieDto.yearReleased;
    movie.genre = createMovieDto.genre;

    return from(this.movieRepository.save(movie));
  }

  update(id: number, movie: MovieI): Observable<MovieI> {
    return from(
      this.movieRepository.update(id, movie).then(() => {
        return { ...movie, id };
      }),
    );
  }

  delete(id: number): Observable<any> {
    return from(this.movieRepository.delete(id));
  }
}
