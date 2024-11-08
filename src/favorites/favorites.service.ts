import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { ArtistService } from '../artist/artist.service';
import { AlbumService } from '../album/album.service';
import { TrackService } from '../track/track.service';
import { Favorites, FavoritesResponse } from './entities/favorite.entity';
import { FavoritesType, FavoritesTypes } from './types/types';

@Injectable()
export class FavoritesService {
  private favorites: Favorites;

  constructor(
    @Inject(forwardRef(() => ArtistService))
    private artistService: ArtistService,
    @Inject(forwardRef(() => AlbumService))
    private albumService: AlbumService,
    @Inject(forwardRef(() => TrackService))
    private trackService: TrackService,
  ) {
    this.favorites = {
      artists: [],
      albums: [],
      tracks: [],
    };
  }

  private validateUUID(id: string, entityType: string): void {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid ${entityType} id`);
    }
  }

  async getAllFavorites(): Promise<FavoritesResponse> {
    const artists = await Promise.all(
      this.favorites.artists.map((id) => this.artistService.findOne(id)),
    );

    const albums = await Promise.all(
      this.favorites.albums.map((id) => this.albumService.findOne(id)),
    );

    const tracks = await Promise.all(
      this.favorites.tracks.map((id) => this.trackService.findOne(id)),
    );

    return {
      artists: artists.filter((artist) => artist !== null),
      albums: albums.filter((album) => album !== null),
      tracks: tracks.filter((track) => track !== null),
    };
  }

  async addFavorite(
    id: string,
    type: FavoritesTypes,
  ): Promise<{ message: string }> {
    this.validateUUID(id, type);

    switch (type) {
      case FavoritesType.ARTIST:
        const artist = await this.artistService.findOne(id);
        if (!artist)
          throw new UnprocessableEntityException(`Artist with ${id} not found`);
        if (this.IsThereArtist(id)) {
          throw new ConflictException(`Artist with this ${id} already exists`);
        } else {
          this.favorites.artists.push(id);
        }
        return { message: `Artist with id ${id} added to favorites` };

      case FavoritesType.ALBUM:
        const album = await this.albumService.findOne(id);
        if (!album)
          throw new UnprocessableEntityException(`Album with ${id} not found`);
        if (this.IsThereAlbum(id)) {
          throw new ConflictException(`Album with this ${id} already exists`);
        } else {
          this.favorites.albums.push(id);
        }
        return { message: `Album with id ${id} added to favorites` };

      case FavoritesType.TRACK:
        const track = await this.trackService.findOne(id);
        if (!track)
          throw new UnprocessableEntityException(`Track with ${id} not found`);
        if (this.IsThereTrack(id)) {
          throw new ConflictException(`Track with this ${id} already exists`);
        } else {
          this.favorites.tracks.push(id);
        }
        return { message: `Track with id ${id} added to favorites` };
    }
  }

  IsThereArtist(artistId: string): boolean {
    return this.favorites.artists.includes(artistId);
  }

  IsThereAlbum(albumId: string): boolean {
    return this.favorites.albums.includes(albumId);
  }

  IsThereTrack(trackId: string): boolean {
    return this.favorites.tracks.includes(trackId);
  }

  async deleteFavorite(
    id: string,
    type: FavoritesTypes,
  ): Promise<{ message: string }> {
    this.validateUUID(id, type);

    switch (type) {
      case FavoritesType.ARTIST:
        const artistIndex = this.favorites.artists.indexOf(id);
        if (artistIndex === -1)
          throw new NotFoundException('Artist not found in favorites');
        this.favorites.artists.splice(artistIndex, 1);
        return { message: `Artist with id ${id} removed from favorites` };

      case FavoritesType.ALBUM:
        const albumIndex = this.favorites.albums.indexOf(id);
        if (albumIndex === -1)
          throw new NotFoundException('Album not found in favorites');
        this.favorites.albums.splice(albumIndex, 1);
        return { message: `Album with id ${id} removed from favorites` };

      case FavoritesType.TRACK:
        const trackIndex = this.favorites.tracks.indexOf(id);
        if (trackIndex === -1)
          throw new NotFoundException('Track not found in favorites');
        this.favorites.tracks.splice(trackIndex, 1);
        return { message: `Track with id ${id} removed from favorites` };
    }
  }
}
