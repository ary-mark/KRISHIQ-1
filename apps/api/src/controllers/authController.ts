import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { Role } from '@prisma/client';

const JWT_EXPIRES_IN = '7d';

export const register = async (req: Request, res: Response) => {
  const { email, password, role, name, phoneNumber } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'email, password and role are required' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role,
      ...(role === Role.FARMER && {
        farmer: {
          create: {
            name,
            phoneNumber,
          },
        },
      }),
    },
    include: { farmer: true },
  });
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
  res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
};

export const logout = async (_req: Request, res: Response) => {
  // With JWT stateless auth, logout is handled client‑side by discarding token.
  res.json({ message: 'Logged out' });
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { farmer: true, admin: true } });
  res.json({ user });
};

