import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../common/enums/user-roles.enum';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUser: User = {
    id: 'test-uuid',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+33123456789',
    password: 'hashedPassword',
    phoneVerified: true,
    roles: [UserRoles.USER],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findByEmailOrPhone: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    validatePassword: jest.fn(),
    addRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    // Setup default config mocks
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        const config = {
          JWT_ACCESS_SECRET: 'test-access-secret',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_ACCESS_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return (config as Record<string, string>)[key] || defaultValue;
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+33123456789',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');

      const result = await authService.signup(signupDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUsersService.create).toHaveBeenCalledWith(signupDto);
    });

    it('should throw ConflictException if user creation fails', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('User exists'),
      );

      await expect(authService.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'john@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      mockUsersService.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.findByEmailOrPhone.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUsersService.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for unverified phone', async () => {
      const unverifiedUser = { ...mockUser, phoneVerified: false };
      mockUsersService.findByEmailOrPhone.mockResolvedValue(unverifiedUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = {
        sub: 'test-uuid',
        email: 'john@example.com',
        roles: [UserRoles.USER],
        type: 'refresh',
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findById.mockResolvedValue({
        ...mockUser,
        refreshTokens: [refreshToken],
      });
      mockJwtService.sign.mockReturnValue('new-token');

      const result = await authService.refreshTokens(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUsersService.removeRefreshToken).toHaveBeenCalledWith(
        'test-uuid',
        refreshToken,
      );
    });

    it('should throw UnauthorizedException for invalid token type', async () => {
      const refreshToken = 'invalid-token';
      const payload = {
        sub: 'test-uuid',
        email: 'john@example.com',
        roles: [UserRoles.USER],
        type: 'access',
      };

      mockJwtService.verify.mockReturnValue(payload);

      await expect(authService.refreshTokens(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
