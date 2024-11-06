import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArtistDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsBoolean({ message: 'Grammy must be a boolean value' })
  @IsOptional()
  grammy: boolean;
}
