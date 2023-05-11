import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Favorite } from './Favorites';
@Entity({ name: 'movie' })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  director: string;

  @Column()
  yearReleased: number;

  @Column()
  genre: string;

  @OneToMany(() => Favorite, (favorite) => favorite.movie)
  favorites: Favorite[];
}
