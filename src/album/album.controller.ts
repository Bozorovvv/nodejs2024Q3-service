import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('album')
@UseGuards(AuthGuard)
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumService.create(createAlbumDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.albumService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.albumService.findOne(id);
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    return this.albumService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.albumService.remove(id);
  }
}
