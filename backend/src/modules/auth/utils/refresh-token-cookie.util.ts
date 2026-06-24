import { CookieOptions, Response } from 'express';

const refreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const refreshTokenClearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});

export const setRefreshTokenCookie = (response: Response, refreshToken: string) => {
  response.cookie('refreshToken', refreshToken, refreshTokenCookieOptions());
};

export const clearRefreshTokenCookie = (response: Response) => {
  response.clearCookie('refreshToken', refreshTokenClearCookieOptions());
};
