import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserResponse } from './entities/user.entity';
import { validate } from 'uuid';

@Injectable()
export class UsersService {
  public db: Map<string, User>;

  constructor() {
    this.db = new Map<string, User>();
  }

  private excludePassword(user: User): UserResponse {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return {
      ...rest,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    if (!createUserDto?.login || !createUserDto?.password) {
      throw new BadRequestException('Login and password are required');
    }

    const { login, password } = createUserDto;

    const existingUser = Array.from(this.db.values()).find(
      (user) => user.login === login,
    );

    if (existingUser) {
      throw new BadRequestException('User with this login already exists');
    }

    const newUser = new User(login, password);
    this.db.set(newUser.id, newUser);

    return this.excludePassword(newUser);
  }

  async findAll(): Promise<UserResponse[]> {
    return Array.from(this.db.values()).map((user) =>
      this.excludePassword(user),
    );
  }

  async findOne(id: string): Promise<UserResponse> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }
    const user = this.db.get(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.excludePassword(user);
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

    const user = this.db.get(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.password !== updateUserDto.oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    user.password = updateUserDto.newPassword;
    user.updatedAt = new Date().getTime();
    user.version += 1;
    this.db.set(id, user);

    return this.excludePassword(user);
  }

  async remove(id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const user = this.db.get(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.db.delete(id);
  }
}
