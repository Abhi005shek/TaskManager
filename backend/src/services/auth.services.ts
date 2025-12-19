import bcrypt from 'bcrypt';
import  jwt  from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../repositories/user.repository';


const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists.');
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({
    name,
    email,
    password: hashedPassword,
  });
  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { user, token };
};


export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return { user, token };
};