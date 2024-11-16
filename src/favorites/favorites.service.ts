import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';
import { FavoritesType } from './types/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  private async ensureFavoritesExists() {
    const favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      return this.prisma.favorites.create({
        data: {
          artists: [] as string[],
          albums: [] as string[],
          tracks: [] as string[],
        },
      });
    }
    return favorites;
  }

  async getFavoritesId(): Promise<string> {
    const favorites = await this.ensureFavoritesExists();
    return favorites.id;
  }

  async getAllFavorites() {
    const favorites = await this.ensureFavoritesExists();

    const [artists, albums, tracks] = await Promise.all([
      this.prisma.artist.findMany({
        where: { id: { in: favorites.artists } },
      }),
      this.prisma.album.findMany({
        where: { id: { in: favorites.albums } },
      }),
      this.prisma.track.findMany({
        where: { id: { in: favorites.tracks } },
      }),
    ]);

    return { artists, albums, tracks };
  }

  async addFavorite(id: string, type: FavoritesType) {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid ${type} id`);
    }

    try {
      const entityExists = await this.checkEntityExists(id, type);
      if (!entityExists) {
        throw new UnprocessableEntityException(
          `${type} with id ${id} not found`,
        );
      }
    } catch (error) {
      throw new UnprocessableEntityException(`${type} with id ${id} not found`);
    }

    const favorites = await this.ensureFavoritesExists();
    const arrayField = `${type.toLowerCase()}s`;

    if (favorites[arrayField].includes(id)) {
      return { message: `${type} with id ${id} is already in favorites` };
    }

    await this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        [arrayField]: {
          push: id,
        },
      },
    });

    return { message: `${type} with id ${id} added to favorites` };
  }

  async deleteFavorite(id: string, type: FavoritesType) {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid ${type} id`);
    }

    const favorites = await this.ensureFavoritesExists();
    const arrayField = `${type.toLowerCase()}s`;

    if (!favorites[arrayField].includes(id)) {
      throw new NotFoundException(
        `${type} with id ${id} not found in favorites`,
      );
    }

    await this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        [arrayField]: {
          set: favorites[arrayField].filter((itemId) => itemId !== id),
        },
      },
    });
  }

  private async checkEntityExists(
    id: string,
    type: FavoritesType,
  ): Promise<boolean> {
    const model = this.prisma[type.toLowerCase()];
    const entity = await model.findUnique({
      where: { id },
    });
    return !!entity;
  }
}
