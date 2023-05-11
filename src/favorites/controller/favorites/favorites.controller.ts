import { Controller } from '@nestjs/common';
import { Body, Delete, Get, Param, Put, Post } from '@nestjs/common';
import { FavoriteService } from 'src/favorites/service/favorites/favorites.service';
import { MovieI } from 'src/movie/model/movie.interface';
import { Favorite } from 'src/typeorm/entities/Favorites';
@Controller('favorites')
export class FavoritesController {
  constructor(private favoriteService: FavoriteService) {}

  @Post(':userId/:movieId')
  async addFavorite(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
  ): Promise<Favorite> {
    return await this.favoriteService.addFavorite(
      parseInt(userId),
      parseInt(movieId),
    );
  }

  @Delete(':userId/:movieId')
  async removeFavorite(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
  ): Promise<void> {
    await this.favoriteService.removeFavorite(
      parseInt(userId),
      parseInt(movieId),
    );
  }

  @Get(':userId')
  async getUserFavorites(@Param('userId') userId: string): Promise<MovieI[]> {
    return await this.favoriteService.getUserFavorites(parseInt(userId));
  }
}
