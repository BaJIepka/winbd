import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const tokens = await authService.register(req.body.email as string, req.body.password as string);
  res.status(201).json(tokens);
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const tokens = await authService.login(req.body.email as string, req.body.password as string);
  res.json(tokens);
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const tokens = await authService.refresh(req.body.refreshToken as string);
  res.json(tokens);
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) await authService.logout(refreshToken);
  res.status(204).send();
}
