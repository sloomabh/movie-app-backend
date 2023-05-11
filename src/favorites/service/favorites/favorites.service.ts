import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { Favorite } from 'src/typeorm/entities/Favorites';
import { User } from 'src/typeorm/entities/User';
import { Movie } from 'src/typeorm/entities/Movie';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieI } from 'src/movie/model/movie.interface';
import { UserI } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user/user.service';
import { MovieService } from 'src/movie/service/movie/movie.service';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async addFavorite(
    userId: number,
    movieId: number,
  ): Promise<
    | { statusCode: number; message: 'Movie added to your favorite list.' }
    | {
        statusCode: number;
        message: 'This movie is already in your favorite list.';
      }
  > {
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, movie: { id: movieId } },
    });

    if (existingFavorite) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'This movie is already in your favorite list.',
      };
    }

    const favorite = new Favorite();
    favorite.user = { id: userId } as User;
    favorite.movie = { id: movieId } as Movie;
    await this.favoriteRepository.save(favorite);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Movie added to your favorite list.',
    };
  }

  async removeFavorite(userId: number, movieId: number): Promise<Favorite[]> {
    await this.favoriteRepository.delete({
      user: { id: userId },
      movie: { id: movieId },
    });
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['movie'],
    });
    return favorites;
  }

  async getUserFavorites(userId: number): Promise<MovieI[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['movie'],
    });
    return favorites.map((favorite) => favorite.movie);
  }
}
