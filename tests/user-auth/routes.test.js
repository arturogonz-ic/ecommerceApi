import { describe, it, expect } from 'vitest';
import { api, createUser } from '../helpers.js';

describe('POST /user-auth/register', () => {
  it('creates a user and sets cookie', async () => {
    const res = await api.post('/user-auth/register').send({
      email: 'new@test.com',
      password: 'password123',
      name: 'New User',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('new@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 409 when email already exists', async () => {
    await createUser({ email: 'dup@test.com' });

    const res = await api.post('/user-auth/register').send({
      email: 'dup@test.com',
      password: 'password123',
      name: 'Dup',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for weak password', async () => {
    const res = await api.post('/user-auth/register').send({
      email: 'weak@test.com',
      password: '123',
      name: 'Weak',
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const res = await api.post('/user-auth/register').send({
      email: 'not-an-email',
      password: 'password123',
      name: 'Bad',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /user-auth/login', () => {
  it('returns user and sets cookie on valid credentials', async () => {
    await createUser({ email: 'login@test.com' });

    const res = await api.post('/user-auth/login').send({
      email: 'login@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('login@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    await createUser({ email: 'wrong@test.com' });

    const res = await api.post('/user-auth/login').send({
      email: 'wrong@test.com',
      password: 'wrongpass',
    });

    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await api.post('/user-auth/login').send({
      email: 'ghost@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
  });
});

describe('POST /user-auth/logout', () => {
  it('clears the cookie', async () => {
    const res = await api.post('/user-auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /user-auth/me', () => {
  it('returns user profile when authenticated', async () => {
    await createUser({ email: 'me@test.com' });
    const cookie = await (async () => {
      const r = await api.post('/user-auth/login').send({ email: 'me@test.com', password: 'password123' });
      return r.headers['set-cookie'];
    })();

    const res = await api.get('/user-auth/me').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@test.com');
  });

  it('returns 401 without cookie', async () => {
    const res = await api.get('/user-auth/me');
    expect(res.status).toBe(401);
  });
});
