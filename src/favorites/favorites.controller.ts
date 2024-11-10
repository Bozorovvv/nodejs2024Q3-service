import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesType } from './types/types';

@Controller('favs')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getAllFavorites() {
    return this.favoritesService.getAllFavorites();
  }

  @Post('track/:id')
  @HttpCode(HttpStatus.CREATED)
  async addTrackToFavorites(@Param('id') id: string) {
    return await this.favoritesService.addFavorite(id, FavoritesType.TRACK);
  }

  @Delete('track/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTrackFromFavorites(@Param('id') id: string) {
    return await this.favoritesService.deleteFavorite(id, FavoritesType.TRACK);
  }

  @Post('album/:id')
  @HttpCode(HttpStatus.CREATED)
  async addAlbumToFavorites(@Param('id') id: string) {
    return await this.favoritesService.addFavorite(id, FavoritesType.ALBUM);
  }

  @Delete('album/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAlbumFromFavorites(@Param('id') id: string) {
    return await this.favoritesService.deleteFavorite(id, FavoritesType.ALBUM);
  }

  @Post('artist/:id')
  @HttpCode(HttpStatus.CREATED)
  async addArtistToFavorites(@Param('id') id: string) {
    return await this.favoritesService.addFavorite(id, FavoritesType.ARTIST);
  }

  @Delete('artist/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeArtistFromFavorites(@Param('id') id: string) {
    return await this.favoritesService.deleteFavorite(id, FavoritesType.ARTIST);
  }
}
