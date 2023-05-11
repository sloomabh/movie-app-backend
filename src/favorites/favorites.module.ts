import { Module } from '@nestjs/common';
import { FavoritesController } from './controller/favorites/favorites.controller';
import { FavoriteService } from './service/favorites/favorites.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from 'src/typeorm/entities/Favorites';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite]), AuthModule],
  controllers: [FavoritesController],
  providers: [FavoriteService],
})
export class FavoritesModule {}
