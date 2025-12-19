import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const requireUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token as string | undefined;

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = { id: decoded.userId };
    return next();
  } catch {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token',
    });
  }
};
