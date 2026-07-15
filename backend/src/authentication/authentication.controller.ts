import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
// @ts-ignore - IDE TS Server caching issue
import { RegisterDto } from './dto/register.dto';
// @ts-ignore - IDE TS Server caching issue
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
