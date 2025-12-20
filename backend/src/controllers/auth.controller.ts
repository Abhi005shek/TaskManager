import { Request, Response } from 'express';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { registerUser, loginUser } from '../services/auth.services';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    const { user, token } = await registerUser(name, email, password);

    res
      .cookie('token', token, cookieOptions)
      .status(201)
      .json({
        status: 'success',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (err: any) {
    const message = err.message || 'Registration failed';
    const status = message === 'User already exists.' ? 409 : 400;

    res.status(status).json({ status: 'fail', message });
  }
};


export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUser(email, password);

    res
      .cookie('token', token, cookieOptions)
      .status(200)
      .json({
        status: 'success',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (err: any) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  }
};


export const logout = (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    expires: new Date(0),
  });
  return res.status(200).json({ message: 'Logged out successfully' });
}