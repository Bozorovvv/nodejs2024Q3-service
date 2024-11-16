import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { Track } from './entities/track.entity';
import { validate } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    const { name, albumId, duration, artistId } = createTrackDto;

    try {
      return await this.prisma.track.create({
        data: {
          name,
          duration,
          artistId: artistId || null,
          albumId: albumId || null,
        },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid artist or album reference');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.track.findMany();
  }

  async findOne(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto) {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const { name, duration, artistId, albumId } = updateTrackDto;

    if (artistId && !validate(artistId)) {
      throw new BadRequestException('Artist UUID is not valid');
    }

    if (albumId && !validate(albumId)) {
      throw new BadRequestException('Album UUID is not valid');
    }

    try {
      const existingTrack = await this.prisma.track.findUnique({
        where: { id },
      });
      if (!existingTrack) {
        throw new NotFoundException(`Track with ID ${id} does not exist.`);
      }
      const track = await this.prisma.track.update({
        where: { id },
        data: {
          name,
          duration,
          artistId: artistId === undefined ? undefined : artistId || null,
          albumId: albumId === undefined ? undefined : albumId || null,
        },
      });

      return track;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid artist or album reference');
      }
      throw error;
    }
  }

  async remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    try {
      await this.findOne(id);
      await this.prisma.$transaction(async (tx) => {
        const favoritesList = await tx.favorites.findMany({
          where: { tracks: { has: id } },
        });

        for (const favorite of favoritesList) {
          await tx.favorites.update({
            where: { id: favorite.id },
            data: {
              tracks: {
                set: favorite.tracks.filter((trackId) => trackId !== id),
              },
            },
          });
        }

        await tx.track.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Track with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getTracksByArtistId(artistId: string) {
    return this.prisma.track.findMany({
      where: { artistId },
    });
  }

  async getTracksByAlbumId(albumId: string) {
    return this.prisma.track.findMany({
      where: { albumId },
    });
  }
}
