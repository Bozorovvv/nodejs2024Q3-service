import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from './entities/album.entity';
import { validate } from 'uuid';

@Injectable()
export class AlbumService {
  private db: Map<string, Album>;

  constructor() {
    this.db = new Map<string, Album>();
  }

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const { name, year, artistId } = createAlbumDto;

    const existingAlbum = Array.from(this.db.values()).find(
      (album) => album.name === name,
    );

    if (existingAlbum) {
      throw new BadRequestException('Album with this name already exists');
    }

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
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const album = await this.findOne(id);

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    if (updateAlbumDto.name !== undefined) {
      album.name = updateAlbumDto.name;
    }

    if (updateAlbumDto.year !== undefined) {
      album.year = updateAlbumDto.year;
    }

    if (updateAlbumDto.artistId !== undefined) {
      if (updateAlbumDto.artistId && !validate(updateAlbumDto.artistId)) {
        throw new BadRequestException('Artist UUID is not valid');
      }
      album.artistId = updateAlbumDto.artistId;
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

    this.db.delete(id);
  }
}
