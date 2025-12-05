import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AUTH_MESSAGES } from '../common/constants/error-messages.constants';
import { TOKEN_TYPES } from '../common/constants/app.constants';

export interface JwtPayload {
  sub: string;
  roles: string[];
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, phone, ...userData } = signupDto;

    try {
      const user = await this.usersService.create({
        email,
        phone,
        ...userData,
      });
      this.logger.log(`New user created with ID: ${user.id}`);
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.warn(
          `Signup attempt with existing email/phone: ${email}/${phone}`,
        );
        throw new ConflictException(AUTH_MESSAGES.USER_EXISTS);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { identifier, password } = loginDto;

    const user = await this.usersService.findByEmailOrPhone(identifier);
    if (!user) {
      this.logger.warn(`Login attempt with unknown identifier: ${identifier}`);
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for user ID: ${user.id}`);
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.phoneVerified) {
      this.logger.warn(
        `Login attempt with unverified phone for user ID: ${user.id}`,
      );
      throw new UnauthorizedException(AUTH_MESSAGES.PHONE_NOT_VERIFIED);
    }

    this.logger.log(`Successful login for user ID: ${user.id}`);
    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET');
      if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET environment variable is required');
      }

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      if (payload.type !== TOKEN_TYPES.REFRESH) {
        throw new UnauthorizedException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.refreshTokens.includes(refreshToken)) {
        this.logger.warn(`Invalid refresh token used for user ID: ${user.id}`);
        throw new UnauthorizedException(AUTH_MESSAGES.INVALID_TOKEN);
      }

      await this.usersService.removeRefreshToken(user.id, refreshToken);
      this.logger.log(`Token refreshed for user ID: ${user.id}`);

      return this.generateTokens(user);
    } catch (error) {
      this.logger.warn(
        `Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException(AUTH_MESSAGES.TOKEN_EXPIRED);
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId, refreshToken);
    this.logger.log(`User logged out: ${userId}`);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.usersService.clearAllRefreshTokens(userId);
    this.logger.log(`User logged out from all devices: ${userId}`);
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are required in environment variables');
    }

    const payload: Omit<JwtPayload, 'type'> = {
      sub: user.id,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, type: TOKEN_TYPES.ACCESS },
      {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: TOKEN_TYPES.REFRESH },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      },
    );

    await this.usersService.addRefreshToken(user.id, refreshToken);

    const expiresInSeconds = this.parseExpiresIn(accessExpiresIn!);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60; // default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 15 * 60;
    }
  }

  async verifyPhone(
    verifyPhoneDto: VerifyPhoneDto,
  ): Promise<{ message: string }> {
    const { phone, verificationCode } = verifyPhoneDto;

    // Code fixe pour dev/test - en prod il faudrait un vrai système SMS
    if (verificationCode !== '123456') {
      this.logger.warn(`Invalid verification code attempt for phone: ${phone}`);
      throw new BadRequestException(AUTH_MESSAGES.INVALID_VERIFICATION_CODE);
    }

    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      this.logger.warn(
        `Phone verification attempt for non-existent phone: ${phone}`,
      );
      throw new BadRequestException(AUTH_MESSAGES.USER_NOT_FOUND);
    }

    if (user.phoneVerified) {
      this.logger.warn(
        `Phone verification attempt for already verified phone: ${phone}`,
      );
      throw new BadRequestException(AUTH_MESSAGES.PHONE_ALREADY_VERIFIED);
    }

    await this.usersService.updatePhoneVerification(user.id, true);
    this.logger.log(`Phone verified successfully for user ID: ${user.id}`);

    return { message: 'Téléphone vérifié avec succès' };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return await this.usersService.findById(payload.sub);
  }
}
