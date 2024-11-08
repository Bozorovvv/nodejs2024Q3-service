import { v4 as uuidv4 } from 'uuid';

export interface IAlbum {
  id: string;
  name: string;
  year: number;
  artistId: string | null;
}

export class Album implements IAlbum {
  id: string;
  name: string;
  year: number;
  artistId: string | null;

  constructor(name: string, year: number, artistId: string | null = null) {
    this.id = uuidv4();
    this.name = name;
    this.year = year;
    this.artistId = artistId;
  }
}
