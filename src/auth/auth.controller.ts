import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RefreshTokenDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
}
