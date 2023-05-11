import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Movie } from './Movie';

@Entity({ name: 'favorite' })
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.favorites)
  movie: Movie;
}
