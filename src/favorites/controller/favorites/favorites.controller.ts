import { Controller } from '@nestjs/common';
import { Delete, Get, UseGuards, Param, Post } from '@nestjs/common';
import { FavoriteService } from 'src/favorites/service/favorites/favorites.service';
import { MovieI } from 'src/movie/model/movie.interface';
import { Favorite } from 'src/typeorm/entities/Favorites';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
@Controller('favorites')
export class FavoritesController {
  constructor(private favoriteService: FavoriteService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':userId/:movieId')
  async addFavorite(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
  ): Promise<{ statusCode: number; message: string }> {
    const result = await this.favoriteService.addFavorite(
      parseInt(userId),
      parseInt(movieId),
    );
    return result;
  }

  // DELETE MOVIE FROM FAVORITES
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/:movieId')
  async removeFavorite(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
  ): Promise<Favorite[]> {
    const favorites = await this.favoriteService.removeFavorite(
      parseInt(userId),
      parseInt(movieId),
    );
    return favorites;
  }

  // GET FAVORITES
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getUserFavorites(@Param('userId') userId: string): Promise<MovieI[]> {
    return await this.favoriteService.getUserFavorites(parseInt(userId));
  }
}
