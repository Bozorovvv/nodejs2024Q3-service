import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { Artist } from './entities/artist.entity';
import { validate } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ArtistService {
  public db: Map<string, Artist>;

  constructor(private prisma: PrismaService) {}

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    if (!createArtistDto.name || typeof createArtistDto.grammy !== 'boolean') {
      throw new BadRequestException('Name and grammy fields are required');
    }

    const { name, grammy } = createArtistDto;

    if (typeof name !== 'string' || typeof grammy !== 'boolean') {
      throw new BadRequestException('Invalid data types');
    }

    return this.prisma.artist.create({
      data: {
        name,
        grammy,
      },
    });
  }
  async findAll(): Promise<Artist[]> {
    return this.prisma.artist.findMany();
  }

  async findOne(id: string): Promise<Artist> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return artist;
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    if (!validate(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    if (!updateArtistDto || typeof updateArtistDto !== 'object') {
      throw new BadRequestException('Invalid update data');
    }

    const { name, grammy } = updateArtistDto;

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      throw new BadRequestException('Name must be a non-empty string');
    }
    if (grammy !== undefined && typeof grammy !== 'boolean') {
      throw new BadRequestException('Grammy must be a boolean');
    }

    const existingArtist = await this.prisma.artist.findUnique({
      where: { id },
    });
    if (!existingArtist) {
      throw new NotFoundException(`Artist with ID ${id} does not exist.`);
    }

    try {
      return await this.prisma.artist.update({
        where: { id },
        data: updateArtistDto,
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }
    try {
      await this.findOne(id);

      await this.prisma.$transaction(async (tx) => {
        const favoritesList = await tx.favorites.findMany({
          where: { artists: { has: id } },
        });

        for (const favorite of favoritesList) {
          await tx.favorites.update({
            where: { id: favorite.id },
            data: {
              artists: {
                set: favorite.artists.filter((artistId) => artistId !== id),
              },
            },
          });
        }

        await tx.album.updateMany({
          where: { artistId: id },
          data: { artistId: null },
        });

        await tx.track.updateMany({
          where: { artistId: id },
          data: { artistId: null },
        });

        await tx.artist.delete({
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
}
