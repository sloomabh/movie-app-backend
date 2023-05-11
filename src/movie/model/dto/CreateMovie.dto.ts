import { IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  director: string;

  @IsNotEmpty()
  yearReleased: string;

  @IsNotEmpty()
  genre: string;
}
