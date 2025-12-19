import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("req body: ", req.body)
      schema.parse({
        body: req.body,
      });
      console.log("Came here 💪");
      return next();
    } catch (e: any) {
      console.log("Came here 😈");
      return res.status(400).json({
        status: 'fail',
        message: e.errors?.[0]?.message ?? 'Invalid request data',
      });
    }
  };

export default validateResource;
