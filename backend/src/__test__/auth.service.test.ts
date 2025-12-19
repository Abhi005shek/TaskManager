import * as authService from '../services/auth.services';
import * as userRepo from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

jest.mock('../repositories/user.repository');

const mockedUserRepo = userRepo as jest.Mocked<typeof userRepo>;

describe('auth.service', () => {
  const email = 'test@example.com';
  const name = 'Test User';
  const password = 'password123';

  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRES_IN = '7d';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registerUser creates user when email is free', async () => {
    const mockUser = {
      id: 'user-id-1',
      name,
      email,
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    mockedUserRepo.findUserByEmail.mockResolvedValueOnce(null);
    mockedUserRepo.createUser.mockResolvedValueOnce(mockUser);

    const { user, token } = await authService.registerUser(name, email, password);

    expect(mockedUserRepo.findUserByEmail).toHaveBeenCalledWith(email);
    expect(mockedUserRepo.createUser).toHaveBeenCalledWith({
      name,
      email,
      password: expect.any(String)
    });
    expect(user.email).toBe(email);
    expect(token).toBeDefined();
  });

  it('registerUser throws if email is already taken', async () => {
    const existingUser = {
      id: '1',
      email,
      name: 'Existing User',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    mockedUserRepo.findUserByEmail.mockResolvedValueOnce(existingUser);

    await expect(
      authService.registerUser(name, email, password),
    ).rejects.toThrow('User already exists.');
  });

  it('loginUser throws on wrong password', async () => {
    const userWithPassword = {
      id: '1',
      email,
      password: await bcrypt.hash('correct', 10),
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    mockedUserRepo.findUserByEmail.mockResolvedValueOnce(userWithPassword);

    await expect(
      authService.loginUser(email, 'wrong'),
    ).rejects.toThrow('Invalid email or password');
  });

  it('loginUser returns user and token on correct credentials', async () => {
  const plainPassword = 'password123';
  const hashed = await bcrypt.hash(plainPassword, 10);

  const existingUser = {
    id: 'user-login-1',
    email,
    name,
    password: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  mockedUserRepo.findUserByEmail.mockResolvedValueOnce(existingUser);

  const { user, token } = await authService.loginUser(email, plainPassword);

  expect(mockedUserRepo.findUserByEmail).toHaveBeenCalledWith(email);
  expect(user.id).toBe('user-login-1');
  expect(token).toBeDefined();
  });

});