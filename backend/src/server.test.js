import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './server.js';

describe('PRERNA API', () => {
  it('reports application health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns a structured 404', async () => {
    const response = await request(app).get('/api/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('protects the full team directory behind admin authentication', async () => {
    const response = await request(app).get('/api/team/admin');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('protects community profiles behind community authentication', async () => {
    const response = await request(app).get('/api/community/profile');
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
