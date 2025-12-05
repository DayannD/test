export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}
