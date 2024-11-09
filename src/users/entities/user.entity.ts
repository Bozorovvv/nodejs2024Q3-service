import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  id: string;
  login: string;
  password: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  id: string;
  login: string;
  password: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(login: string, password: string) {
    this.id = uuidv4();
    this.login = login;
    this.password = password;
    this.version = 1;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export type UserResponse = Omit<User, 'password'>;
