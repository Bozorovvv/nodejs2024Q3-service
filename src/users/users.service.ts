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
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
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
    return Array.from(this.db.values()).map(this.excludePassword);
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
    const { newPassword, oldPassword } = updateUserDto;

    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const user = this.db.get(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.password !== oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    if (newPassword) {
      user.password = newPassword;
      user.updatedAt = new Date();
      user.version = user.version + 1;
      this.db.set(id, user);

      return this.excludePassword(user);
    }

    return this.excludePassword(user);
  }

  async remove(id: string): Promise<void> {
    if (!validate(id)) {
      throw new BadRequestException('UUID is not valid');
    }

    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.db.delete(id);
  }
}
