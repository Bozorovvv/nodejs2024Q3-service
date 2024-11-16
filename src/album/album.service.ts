import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { Album } from './entities/album.entity';
import { validate } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlbumService {
  constructor(private prisma: PrismaService) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const { name, year, artistId } = createAlbumDto;

    try {
      return await this.prisma.album.create({
        data: {
          name,
          year,
          artistId: artistId || null,
        },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid artist reference');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.album.findMany();
  }

  async findOne(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    return album;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto) {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const { name, year, artistId } = updateAlbumDto;

    if (artistId && !validate(artistId)) {
      throw new BadRequestException('Artist UUID is not valid');
    }

    try {
      const existingAlbum = await this.prisma.album.findUnique({
        where: { id },
      });
      if (!existingAlbum) {
        throw new NotFoundException(`Album with ID ${id} does not exist.`);
      }
      const album = await this.prisma.album.update({
        where: { id },
        data: {
          name,
          year,
          artistId: artistId === undefined ? undefined : artistId || null,
        },
      });

      return album;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid artist reference');
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
          where: { albums: { has: id } },
        });

        for (const favorite of favoritesList) {
          await tx.favorites.update({
            where: { id: favorite.id },
            data: {
              albums: {
                set: favorite.albums.filter((albumId) => albumId !== id),
              },
            },
          });
        }

        await tx.track.updateMany({
          where: { albumId: id },
          data: { albumId: null },
        });

        await tx.album.delete({
          where: { id },
        });
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Album with ID ${id} not found`);
      }
      throw error;
    }
  }

  async getAlbumsByArtistId(artistId: string) {
    return this.prisma.album.findMany({
      where: { artistId },
    });
  }
}
