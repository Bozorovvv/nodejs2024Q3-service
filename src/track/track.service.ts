import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { Track } from './entities/track.entity';
import { validate } from 'uuid';

@Injectable()
export class TrackService {
  public db: Map<string, Track>;

  constructor() {
    this.db = new Map<string, Track>();
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    const { name, albumId, duration, artistId } = createTrackDto;

    const existingTrack = Array.from(this.db.values()).find(
      (album) => album.name === name,
    );

    if (existingTrack) {
      throw new BadRequestException('Track with this name already exists');
    }

    const track = new Track(name, duration, artistId || null, albumId || null);
    this.db.set(track.id, track);

    return track;
  }

  async findAll(): Promise<Track[]> {
    return Array.from(this.db.values());
  }

  async findOne(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }
    const track = this.db.get(id);

    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }
    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto) {
    const { name, duration, artistId, albumId } = updateTrackDto;
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const track = await this.findOne(id);

    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    if (name !== undefined) {
      track.name = name;
    }

    if (duration !== undefined) {
      track.duration = duration;
    }

    if (artistId !== undefined) {
      if (artistId && !validate(artistId)) {
        throw new BadRequestException('Artist UUID is not valid');
      }
      track.artistId = artistId;
    }

    if (albumId) {
      if (albumId && !validate(albumId)) {
        throw new BadRequestException('Album UUID is not valid');
      }
      track.albumId = albumId;
    }

    this.db.set(id, track);
    return track;
  }

  async remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const track = await this.findOne(id);

    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    this.db.delete(id);
  }
}
