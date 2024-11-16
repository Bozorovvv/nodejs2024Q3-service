import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser, PrismaUser, UserResponse } from './entities/user.entity';
import { validate } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private convertPrismaUserToIUser(prismaUser: PrismaUser): IUser {
    return {
      ...prismaUser,
      createdAt: Number(prismaUser.createdAt),
      updatedAt: Number(prismaUser.updatedAt),
    };
  }

  private excludePassword(user: IUser): UserResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return rest;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    if (!createUserDto?.login || !createUserDto?.password) {
      throw new BadRequestException('Login and password are required');
    }

    const { login, password } = createUserDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      throw new BadRequestException(`User with this ${login} already exists`);
    }

    try {
      const newUser = await this.prisma.user.create({
        data: {
          login,
          password,
          createdAt: BigInt(Date.now()),
          updatedAt: BigInt(Date.now()),
        },
      });

      const user = this.convertPrismaUserToIUser(newUser);
      return this.excludePassword(user);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(`User with this ${login} already exists`);
      }
      throw error;
    }
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) =>
      this.excludePassword(this.convertPrismaUserToIUser(user)),
    );
  }

  async findOne(id: string): Promise<UserResponse> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.excludePassword(this.convertPrismaUserToIUser(user));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    if (!updateUserDto?.oldPassword || !updateUserDto?.newPassword) {
      throw new BadRequestException(
        'Old password and new password are required',
      );
    }

    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.password !== updateUserDto.oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: updateUserDto.newPassword,
        updatedAt: BigInt(Date.now()),
        version: { increment: 1 },
      },
    });

    return this.excludePassword(this.convertPrismaUserToIUser(updatedUser));
  }

  async remove(id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} does not exist.`);
      }
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
