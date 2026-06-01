import request from 'supertest';
import { createApp } from '../../app';
import { TokenService } from '../../services/token.service';
import { UserRepository } from '../../repositories/user.repository';

// Mock token verification and user repo
jest.mock('../../services/token.service');
jest.mock('../../repositories/user.repository');

const app = createApp();

describe('Profile Routes Integration', () => {
  const mockUser = {
    id: 'user-99',
    email: 'alice@example.com',
    role: 'USER',
    firstName: 'Alice',
    lastName: 'Smith',
    createdAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no Authorization header provided', async () => {
    await request(app).get('/api/profile').expect(401);
  });

  it('should return 200 with public profile when token valid', async () => {
    const payload = { sub: mockUser.id, role: mockUser.role };
    (TokenService.verifyAccessToken as jest.Mock).mockReturnValue(payload);
    (UserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    const token = 'valid.jwt.token';
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      createdAt: mockUser.createdAt.toISOString(),
    });
    expect(UserRepository.findById).toHaveBeenCalledWith(mockUser.id);
  });

  it('should return 401 for malformed token', async () => {
    (TokenService.verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer badtoken')
      .expect(401);
  });
});
