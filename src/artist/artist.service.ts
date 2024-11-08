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
    const { name, grammy } = createArtistDto;

    const existingArtist = Array.from(this.db.values()).find(
      (artist) => artist.name === name,
    );

    if (existingArtist) {
      throw new BadRequestException('Artist with this name already exists');
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
    const { newName, grammy } = updateArtistDto;

    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const artist = await this.findOne(id);

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    let isModified = false;

    if (newName !== undefined && artist.name !== newName) {
      artist.name = newName;
      isModified = true;
    }

    if (grammy !== undefined && artist.grammy !== grammy) {
      artist.grammy = grammy;
      isModified = true;
    }

    if (isModified) {
      this.db.set(id, artist);
    }
    return artist;
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

  async removeArtistFromFavorites(artistId: string) {
    if (this.favoritesService.IsThereArtist(artistId)) {
      await this.favoritesService.deleteFavorite(
        artistId,
        FavoritesType.ARTIST,
      );
    }
  }

  async removeArtistFromAlbums(artistId: string) {
    const albums = await this.albumService.getAlbumsByArtistId(artistId);

    if (albums.length > 0) {
      for (const album of albums) {
        album.artistId = null;
        this.albumService.update(album.id, album);
      }
    }
  }

  async removeArtistFromTracks(artistId: string) {
    const tracks = await this.trackService.getTracksByArtistId(artistId);

    if (tracks.length > 0) {
      for (const track of tracks) {
        track.artistId = null;
        this.trackService.update(track.id, track);
      }
    }
  }
}
