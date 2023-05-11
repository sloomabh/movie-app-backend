import { Injectable, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { Favorite } from 'src/typeorm/entities/Favorites';
import { User } from 'src/typeorm/entities/User';
import { Movie } from 'src/typeorm/entities/Movie';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieI } from 'src/movie/model/movie.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  @UseGuards(JwtAuthGuard)
  async addFavorite(userId: number, movieId: number): Promise<Favorite> {
    const favorite = new Favorite();
    favorite.user = { id: userId } as User;
    favorite.movie = { id: movieId } as Movie;
    return await this.favoriteRepository.save(favorite);
  }

  @UseGuards(JwtAuthGuard)
  async removeFavorite(userId: number, movieId: number): Promise<void> {
    await this.favoriteRepository.delete({
      user: { id: userId },
      movie: { id: movieId },
    });
  }

  @UseGuards(JwtAuthGuard)
  async getUserFavorites(userId: number): Promise<MovieI[]> {
    const favorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['movie'],
    });
    return favorites.map((favorite) => favorite.movie);
  }
}
