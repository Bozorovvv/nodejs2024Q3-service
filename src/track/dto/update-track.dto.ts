import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackDto } from './create-track.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTrackDto extends PartialType(CreateTrackDto) {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  artistId?: string | null;

  @IsOptional()
  @IsString()
  albumId?: string | null;

  @IsNumber()
  duration: number;
}
