import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { USER_MESSAGES } from '../common/constants/error-messages.constants';
import { UserRoles } from '../common/enums/user-roles.enum';

@Injectable()
export class UsersService {
  private readonly bcryptRounds: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    this.bcryptRounds =
      typeof rounds === 'string' ? parseInt(rounds, 10) : rounds;
    console.log(
      'BCRYPT_ROUNDS configured as:',
      this.bcryptRounds,
      'type:',
      typeof this.bcryptRounds,
    );
  }

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.password) {
      throw new Error(USER_MESSAGES.PASSWORD_REQUIRED);
    }

    if (!userData.email) {
      throw new Error(USER_MESSAGES.EMAIL_REQUIRED);
    }

    if (!userData.phone) {
      throw new Error(USER_MESSAGES.PHONE_REQUIRED);
    }

    const existingUserByEmail = await this.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new ConflictException(USER_MESSAGES.USER_EMAIL_EXISTS);
    }

    const existingUserByPhone = await this.findByPhone(userData.phone);
    if (existingUserByPhone) {
      throw new ConflictException(USER_MESSAGES.USER_PHONE_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.bcryptRounds,
    );

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      phoneVerified: false,
      roles: [UserRoles.USER],
      refreshTokens: [],
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    return this.userRepository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    if (!phone) return null;
    return this.userRepository.findOne({ where: { phone } });
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    if (!identifier) return null;
    return this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
  }

  async findById(id: string): Promise<User | null> {
    if (!id) return null;
    return this.userRepository.findOne({ where: { id } });
  }

  async updatePhoneVerification(
    userId: string,
    verified: boolean,
  ): Promise<void> {
    const result = await this.userRepository.update(
      { id: userId },
      { phoneVerified: verified },
    );

    if (result.affected === 0) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }
  }

  async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }

    const refreshTokens = [...user.refreshTokens, refreshToken];
    await this.userRepository.update({ id: userId }, { refreshTokens });
  }

  async removeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }

    const refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );
    await this.userRepository.update({ id: userId }, { refreshTokens });
  }

  async clearAllRefreshTokens(userId: string): Promise<void> {
    const result = await this.userRepository.update(
      { id: userId },
      { refreshTokens: [] },
    );

    if (result.affected === 0) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password,
        this.bcryptRounds,
      );
    }

    await this.userRepository.update({ id: userId }, updateData);
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException(USER_MESSAGES.UPDATE_ERROR);
    }
    return updatedUser;
  }
}
