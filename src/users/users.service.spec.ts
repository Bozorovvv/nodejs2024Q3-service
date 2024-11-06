import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
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

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'password123',
      };
      const user = await service.create(createUserDto);

      expect(user).toBeDefined();
      expect(user.login).toBe(createUserDto.login);
    });

    it('should throw an error if the user with the same login already exists', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'password123',
      };
      await service.create(createUserDto);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of all users', async () => {
      const createUserDto1: CreateUserDto = {
        login: 'user1',
        password: 'password1',
      };
      const createUserDto2: CreateUserDto = {
        login: 'user2',
        password: 'password2',
      };
      await service.create(createUserDto1);
      await service.create(createUserDto2);

      const users = await service.findAll();

      expect(users.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a user if a valid id is provided', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'password123',
      };
      const createdUser = await service.create(createUserDto);

      const foundUser = await service.findOne(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.login).toBe(createdUser.login);
    });

    it('should throw an error if an invalid UUID is provided', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      await expect(
        service.findOne('1b4e28ba-2fa1-11d2-883f-0016d3cca427'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update the user password if the correct old password is provided', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'oldpassword',
      };
      const createdUser = await service.create(createUserDto);

      const updateUserDto: UpdateUserDto = {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const updatedUser = await service.update(createdUser.id, updateUserDto);

      expect(updatedUser.password).toBe(updateUserDto.newPassword);
      expect(updatedUser.version).toBe(2);
    });

    it('should throw a ForbiddenException if the old password is incorrect', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'oldpassword',
      };
      const createdUser = await service.create(createUserDto);

      const updateUserDto: UpdateUserDto = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };

      await expect(
        service.update(createdUser.id, updateUserDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw a BadRequestException if an invalid UUID is provided', async () => {
      const updateUserDto: UpdateUserDto = {
        oldPassword: 'password',
        newPassword: 'newpassword',
      };

      await expect(
        service.update('invalid-uuid', updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a NotFoundException if the user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        oldPassword: 'password',
        newPassword: 'newpassword',
      };

      await expect(
        service.update('1b4e28ba-2fa1-11d2-883f-0016d3cca427', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the user if a valid id is provided', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'password123',
      };
      const createdUser = await service.create(createUserDto);

      await service.remove(createdUser.id);
      await expect(service.findOne(createdUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a BadRequestException if an invalid UUID is provided', async () => {
      await expect(service.remove('invalid-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a NotFoundException if the user does not exist', async () => {
      await expect(
        service.remove('1b4e28ba-2fa1-11d2-883f-0016d3cca427'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
