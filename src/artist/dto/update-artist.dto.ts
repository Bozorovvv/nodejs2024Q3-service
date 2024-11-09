import { PartialType } from '@nestjs/mapped-types';
import { CreateArtistDto } from './create-artist.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateArtistDto extends PartialType(CreateArtistDto) {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsBoolean({ message: 'Grammy must be a boolean value' })
  @IsOptional()
  grammy?: boolean;
}
