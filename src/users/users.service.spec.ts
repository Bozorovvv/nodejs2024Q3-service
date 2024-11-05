import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      login: 'user4',
      password: 'password4',
    };
    const user = await service.create(createUserDto);
    expect(user.login).toEqual(createUserDto.login);
  });

  it('should throw an error when creating a user with an existing login', async () => {
    const createUserDto: CreateUserDto = {
      login: 'user1',
      password: 'password1',
    };
    await expect(service.create(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should find all users', async () => {
    const users = await service.findAll();
    expect(users.length).toBe(3);
  });

  it('should find a user by ID', async () => {
    const user = await service.findOne('user1-id');
    expect(user).toBeDefined();
    expect(user.login).toEqual('user1');
  });

  it('should throw an error when finding a user with an invalid ID', async () => {
    await expect(service.findOne('invalid-id')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update a user password', async () => {
    const updateUserDto: UpdateUserDto = {
      oldPassword: 'user1',
      newPassword: 'newPassword',
    };
    const user = await service.update('user1-id', updateUserDto);
    expect(user.password).toEqual(updateUserDto.newPassword);
  });

  it('should throw an error when updating with an incorrect old password', async () => {
    const updateUserDto: UpdateUserDto = {
      oldPassword: 'wrongPassword',
      newPassword: 'newPassword',
    };
    await expect(service.update('user1-id', updateUserDto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should remove a user', async () => {
    await service.remove('user1-id');
    await expect(service.findOne('user1-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw an error when removing a user with an invalid ID', async () => {
    await expect(service.remove('invalid-id')).rejects.toThrow(
      BadRequestException,
    );
  });
});
