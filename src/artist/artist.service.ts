import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Artist } from './entities/artist.entity';
import { validate } from 'uuid';
import { FavoritesService } from 'src/favorites/favorites.service';
import { FavoritesType } from 'src/favorites/types/types';
import { AlbumService } from 'src/album/album.service';
import { TrackService } from 'src/track/track.service';

@Injectable()
export class ArtistService {
  public db: Map<string, Artist>;

  constructor(
    @Inject(forwardRef(() => FavoritesService))
    private favoritesService: FavoritesService,
    @Inject(forwardRef(() => AlbumService))
    private albumService: AlbumService,
    @Inject(forwardRef(() => TrackService))
    private trackService: TrackService,
  ) {
    this.db = new Map<string, Artist>();
  }

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    if (!createArtistDto.name || typeof createArtistDto.grammy !== 'boolean') {
      throw new BadRequestException('Name and grammy fields are required');
    }

    const { name, grammy } = createArtistDto;

    if (typeof name !== 'string' || typeof grammy !== 'boolean') {
      throw new BadRequestException('Invalid data types');
    }

    const newArtist = new Artist(name, grammy);
    this.db.set(newArtist.id, newArtist);

    return newArtist;
  }
  async findAll(): Promise<Artist[]> {
    return Array.from(this.db.values());
  }

  async findOne(id: string): Promise<Artist> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }
    const artist = this.db.get(id);

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return artist;
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    try {
      if (!validate(id)) {
        throw new BadRequestException('Invalid ID format');
      }

      if (!updateArtistDto || typeof updateArtistDto !== 'object') {
        throw new BadRequestException('Invalid update data');
      }

      const { name, grammy } = updateArtistDto;

      if (name !== undefined && typeof name !== 'string') {
        throw new BadRequestException('Name must be a string');
      }

      if (grammy !== undefined && typeof grammy !== 'boolean') {
        throw new BadRequestException('Grammy must be a boolean');
      }

      const artist = this.db.get(id);
      if (!artist) {
        throw new NotFoundException(`Artist with ID ${id} not found`);
      }

      if (name !== undefined) {
        artist.name = name;
      }
      if (grammy !== undefined) {
        artist.grammy = grammy;
      }

      this.db.set(id, artist);

      return artist;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const artist = await this.findOne(id);

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    await this.removeArtistFromFavorites(id);
    await this.removeArtistFromAlbums(id);
    await this.removeArtistFromTracks(id);

    this.db.delete(id);
  }

  private async removeArtistFromFavorites(artistId: string) {
    if (await this.favoritesService.IsThereArtist(artistId)) {
      await this.favoritesService.deleteFavorite(
        artistId,
        FavoritesType.ARTIST,
      );
    }
  }

  private async removeArtistFromAlbums(artistId: string) {
    const albums = await this.albumService.getAlbumsByArtistId(artistId);
    for (const album of albums) {
      album.artistId = null;
      await this.albumService.update(album.id, album);
    }
  }

  private async removeArtistFromTracks(artistId: string) {
    const tracks = await this.trackService.getTracksByArtistId(artistId);
    for (const track of tracks) {
      track.artistId = null;
      await this.trackService.update(track.id, track);
    }
  }
}
