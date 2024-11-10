import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from './entities/album.entity';
import { validate } from 'uuid';
import { FavoritesService } from 'src/favorites/favorites.service';
import { FavoritesType } from 'src/favorites/types/types';
import { TrackService } from 'src/track/track.service';

@Injectable()
export class AlbumService {
  public db: Map<string, Album>;

  constructor(
    @Inject(forwardRef(() => FavoritesService))
    private favoritesService: FavoritesService,
    @Inject(forwardRef(() => TrackService))
    private trackService: TrackService,
  ) {
    this.db = new Map<string, Album>();
  }

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const { name, year, artistId } = createAlbumDto;

    const album = new Album(name, year, artistId || null);

    this.db.set(album.id, album);

    return album;
  }

  async findAll(): Promise<Album[]> {
    return Array.from(this.db.values());
  }

  async findOne(id: string): Promise<Album> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }
    const album = this.db.get(id);

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }
    return album;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const { name, year, artistId } = updateAlbumDto;

    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const album = await this.findOne(id);

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    if (name) {
      album.name = name;
    }

    if (year) {
      album.year = year;
    }

    if (artistId !== undefined) {
      if (artistId && !validate(artistId)) {
        throw new BadRequestException('Artist UUID is not valid');
      }
      album.artistId = artistId;
    }

    this.db.set(id, album);
    return album;
  }

  async remove(id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const album = await this.findOne(id);

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    await this.removeAlbumFromFavorites(id);
    await this.removeAlbumFromTracks(id);

    this.db.delete(id);
  }

  async removeAlbumFromFavorites(albumId: string) {
    if (this.favoritesService.IsThereAlbum(albumId)) {
      await this.favoritesService.deleteFavorite(albumId, FavoritesType.ALBUM);
    }
  }

  async removeAlbumFromTracks(albumId: string) {
    const tracks = await this.trackService.getTracksByAlbumId(albumId);

    if (tracks.length > 0) {
      for (const track of tracks) {
        track.albumId = null;
        this.trackService.update(track.id, track);
      }
    }
  }

  async getAlbumsByArtistId(artistId: string): Promise<Album[]> {
    return Array.from(this.db.values()).filter(
      (album) => album.artistId === artistId,
    );
  }
}
