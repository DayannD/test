import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRoles } from '../common/enums/user-roles.enum';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'test-uuid',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+33123456789',
    password: 'hashedPassword',
    phoneVerified: false,
    roles: [UserRoles.USER],
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockConfigService = {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: number) => {
          if (key === 'BCRYPT_ROUNDS') return 12;
          return defaultValue;
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+33123456789',
        password: 'password123',
      };

      userRepository.findOne.mockResolvedValue(null); // No existing users
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const user = await service.create(userData);

      expect(user.email).toBe(mockUser.email);
      expect(user.phoneVerified).toBe(false);
      expect(user.roles).toEqual([UserRoles.USER]);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw ConflictException if email already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+33123456789',
        password: 'password123',
      };

      userRepository.findOne.mockResolvedValueOnce(mockUser); // Email exists

      await expect(service.create(userData)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const user = await service.findByEmail('john@example.com');

      expect(user).toBe(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const user = await service.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword(
        'password123',
        'hashedPassword',
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(
        'wrongpassword',
        'hashedPassword',
      );

      expect(result).toBe(false);
    });
  });

  describe('updatePhoneVerification', () => {
    it('should update phone verification status', async () => {
      const updateResult = { affected: 1, generatedMaps: [], raw: [] };
      userRepository.update.mockResolvedValue(updateResult);

      await service.updatePhoneVerification('test-uuid', true);

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: 'test-uuid' },
        { phoneVerified: true },
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const updateResult = { affected: 0, generatedMaps: [], raw: [] };
      userRepository.update.mockResolvedValue(updateResult);

      await expect(
        service.updatePhoneVerification('non-existent-id', true),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
