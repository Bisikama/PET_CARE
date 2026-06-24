/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const customer = {
    email: 'auth-e2e-customer@example.com',
    password: 'password123',
    fullName: 'Auth E2E Customer',
  };
  const provider = {
    email: 'auth-e2e-provider@example.com',
    password: 'password123',
    fullName: 'Auth E2E Provider',
  };
  const admin = {
    email: 'auth-e2e-admin@example.com',
    password: 'password123',
    fullName: 'Auth E2E Admin',
  };
  const registrationUser = {
    email: 'auth-e2e-register@example.com',
    password: 'password123',
    fullName: 'Auth E2E Register',
  };
  const roleEscalationAttempt = {
    email: 'auth-e2e-escalation@example.com',
    password: 'password123',
    fullName: 'Auth E2E Escalation',
    role: Role.ADMIN,
  };

  const testEmails = [
    customer.email,
    provider.email,
    admin.email,
    registrationUser.email,
    roleEscalationAttempt.email,
  ];

  const getCookies = (response: request.Response) => {
    const header = response.headers['set-cookie'];
    return Array.isArray(header) ? header : header ? [header] : [];
  };

  const getRefreshCookie = (response: request.Response) => {
    const cookie = getCookies(response).find((value) => value.startsWith('refreshToken='));
    return cookie?.split(';')[0] ?? '';
  };

  const login = (email = customer.email, password = customer.password) =>
    request(app.getHttpServer()).post('/auth/login').send({
      email,
      password,
    });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
    await prisma.user.create({
      data: {
        email: customer.email,
        fullName: customer.fullName,
        passwordHash: await bcrypt.hash(customer.password, 12),
        role: Role.CUSTOMER,
      },
    });
    await prisma.user.create({
      data: {
        email: provider.email,
        fullName: provider.fullName,
        passwordHash: await bcrypt.hash(provider.password, 12),
        role: Role.PROVIDER,
      },
    });
    await prisma.user.create({
      data: {
        email: admin.email,
        fullName: admin.fullName,
        passwordHash: await bcrypt.hash(admin.password, 12),
        role: Role.ADMIN,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('registers a customer and never returns sensitive fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registrationUser)
        .expect(201);

      expect(response.body.data).toMatchObject({
        email: registrationUser.email,
        fullName: registrationUser.fullName,
        role: Role.CUSTOMER,
      });
      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body.data).not.toHaveProperty('refreshToken');
    });

    it('rejects duplicate emails', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(registrationUser).expect(400);
    });

    it('rejects invalid registration input', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registrationUser, email: 'not-an-email', password: 'short' })
        .expect(400);
    });

    it('rejects attempts to assign an admin role during registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(roleEscalationAttempt)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('rejects an incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: customer.email, password: 'wrong-password' })
        .expect(403);
    });

    it('returns an access token and an HTTP-only refresh-token cookie', async () => {
      const response = await login().expect(200);

      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.user).toMatchObject({
        email: customer.email,
        fullName: customer.fullName,
        role: Role.CUSTOMER,
      });
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
      expect(response.body.data.user).not.toHaveProperty('refreshToken');
      expect(getCookies(response).join(';')).toContain('HttpOnly');
      expect(getRefreshCookie(response)).not.toBe('');
    });

    it('rejects login if user isActive is false', async () => {
      await prisma.user.update({
        where: { email: customer.email },
        data: { isActive: false },
      });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: customer.email, password: customer.password })
        .expect(403);

      await prisma.user.update({
        where: { email: customer.email },
        data: { isActive: true },
      });
    });
  });

  describe('protected endpoints', () => {
    it('protects GET /auth/me without an access token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('rejects tampered access token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token-signature')
        .expect(401);
    });

    it('returns only safe current-user data from GET /auth/me', async () => {
      const loginResponse = await login().expect(200);
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        email: customer.email,
        fullName: customer.fullName,
        role: Role.CUSTOMER,
      });
      expect(response.body.data).not.toHaveProperty('passwordHash');
      expect(response.body.data).not.toHaveProperty('refreshToken');
    });

    it('prevents a customer from accessing provider and admin APIs', async () => {
      const loginResponse = await login().expect(200);
      const authorization = `Bearer ${loginResponse.body.data.accessToken}`;

      await request(app.getHttpServer())
        .get('/auth/provider/me')
        .set('Authorization', authorization)
        .expect(403);
      await request(app.getHttpServer())
        .get('/auth/admin/me')
        .set('Authorization', authorization)
        .expect(403);
    });

    it('allows a provider to access provider APIs', async () => {
      const loginResponse = await login(provider.email, provider.password).expect(200);
      const authorization = `Bearer ${loginResponse.body.data.accessToken}`;

      await request(app.getHttpServer())
        .get('/auth/provider/me')
        .set('Authorization', authorization)
        .expect(200);
    });

    it('allows an admin to access admin APIs', async () => {
      const loginResponse = await login(admin.email, admin.password).expect(200);
      const authorization = `Bearer ${loginResponse.body.data.accessToken}`;

      await request(app.getHttpServer())
        .get('/auth/admin/me')
        .set('Authorization', authorization)
        .expect(200);
    });
  });

  describe('POST /auth/refresh', () => {
    it('rotates refresh tokens and rejects the old token', async () => {
      const loginResponse = await login().expect(200);
      const oldRefreshCookie = getRefreshCookie(loginResponse);

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', oldRefreshCookie)
        .expect(200);
      const newRefreshCookie = getRefreshCookie(refreshResponse);

      expect(refreshResponse.body.data.accessToken).toEqual(expect.any(String));
      expect(newRefreshCookie).not.toBe('');
      expect(newRefreshCookie).not.toBe(oldRefreshCookie);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', oldRefreshCookie)
        .expect(403);
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', newRefreshCookie)
        .expect(200);
    });

    it('rejects when refresh cookie is missing', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('rejects when refresh cookie is tampered', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'refreshToken=tampered-token-value')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('invalidates the refresh token', async () => {
      const loginResponse = await login().expect(200);
      const refreshCookie = getRefreshCookie(loginResponse);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`)
        .expect(200);

      const user = await prisma.user.findUnique({ where: { email: customer.email } });
      expect(user?.refreshToken).toBeNull();

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(403);
    });
  });
});
