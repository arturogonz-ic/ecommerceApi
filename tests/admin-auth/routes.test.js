import { describe, it, expect } from 'vitest';
import { api, createAdmin } from '../helpers.js';

describe('POST /admin-auth/login', () => {
  it('returns admin and sets cookie on valid credentials', async () => {
    await createAdmin({ email: 'admin@test.com' });

    const res = await api.post('/admin-auth/login').send({
      email: 'admin@test.com',
      password: 'adminpass123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.admin.email).toBe('admin@test.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    await createAdmin({ email: 'admin2@test.com' });

    const res = await api.post('/admin-auth/login').send({
      email: 'admin2@test.com',
      password: 'wrongpass',
    });

    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await api.post('/admin-auth/login').send({
      email: 'ghost@test.com',
      password: 'adminpass123',
    });

    expect(res.status).toBe(401);
  });
});

describe('POST /admin-auth/logout', () => {
  it('clears the cookie', async () => {
    const res = await api.post('/admin-auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /admin-auth/me', () => {
  it('returns admin profile when authenticated', async () => {
    await createAdmin({ email: 'me@admin.com' });
    const r = await api.post('/admin-auth/login').send({ email: 'me@admin.com', password: 'adminpass123' });
    const cookie = r.headers['set-cookie'];

    const res = await api.get('/admin-auth/me').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.admin.email).toBe('me@admin.com');
  });

  it('returns 401 without cookie', async () => {
    const res = await api.get('/admin-auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 when using user_token instead of admin_token', async () => {
    const r = await api.post('/user-auth/register').send({
      email: 'impersonator@test.com',
      password: 'password123',
      name: 'Imp',
    });
    const userCookie = r.headers['set-cookie'];

    const res = await api.get('/admin-auth/me').set('Cookie', userCookie);
    expect(res.status).toBe(401);
  });
});
