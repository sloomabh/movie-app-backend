import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './typeorm/entities/User';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { Movie } from './typeorm/entities/Movie';
import { MovieModule } from './movie/movie.module';
import { FavoritesModule } from './favorites/favorites.module';
import { Favorite } from './typeorm/entities/Favorites';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Movie, Favorite],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    MovieModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
