process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/devconnector_test';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

const register = (name, email) =>
  request(app).post('/api/auth/register').send({ name, email, password: 'password123' });

beforeAll(() => mongoose.connect(process.env.MONGO_URI));
beforeEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
});
afterAll(() => mongoose.disconnect());

describe('auth', () => {
  test('rejects invalid registration input', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: '', email: 'nope', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e) => e.field).sort()).toEqual(['email', 'name', 'password']);
  });

  test('registers, never leaks the password, and blocks duplicates', async () => {
    const res = await register('Ada', 'ada@example.com');
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
    expect((await register('Ada again', 'ada@example.com')).status).toBe(409);
  });

  test('login succeeds with the right password and fails with the wrong one', async () => {
    await register('Ada', 'ada@example.com');
    expect((await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'password123' })).status).toBe(200);
    expect((await request(app).post('/api/auth/login').send({ email: 'ada@example.com', password: 'wrong-password' })).status).toBe(401);
  });

  test('protected routes need a valid token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/posts').set('Authorization', 'Bearer garbage')).status).toBe(401);
  });
});

describe('profile', () => {
  test('create, update, add and remove experience', async () => {
    const { token } = (await register('Ada', 'ada@example.com')).body;
    const auth = { Authorization: `Bearer ${token}` };

    expect((await request(app).get('/api/profile/me').set(auth)).status).toBe(404);
    expect((await request(app).post('/api/profile').set(auth).send({ status: '' })).status).toBe(400);

    const created = await request(app).post('/api/profile').set(auth).send({ status: 'Developer', skills: 'Node.js, React , ' });
    expect(created.status).toBe(200);
    expect(created.body.skills).toEqual(['Node.js', 'React']);

    const withExp = await request(app).put('/api/profile/experience').set(auth).send({ title: 'Engineer', company: 'Acme', from: '2022-01-01' });
    expect(withExp.body.experience).toHaveLength(1);
    const removed = await request(app).delete(`/api/profile/experience/${withExp.body.experience[0]._id}`).set(auth);
    expect(removed.body.experience).toHaveLength(0);
  });

  test('mass assignment is ignored', async () => {
    const { token, user } = (await register('Ada', 'ada@example.com')).body;
    const res = await request(app)
      .post('/api/profile')
      .set({ Authorization: `Bearer ${token}` })
      .send({ status: 'Dev', skills: 'JS', user: '000000000000000000000000', experience: [{ title: 'x' }] });
    expect(res.body.user).toBe(user.id);
    expect(res.body.experience).toHaveLength(0);
  });
});

describe('posts', () => {
  test('full post lifecycle with likes, comments and permissions', async () => {
    const a = (await register('Ada', 'ada@example.com')).body;
    const b = (await register('Bob', 'bob@example.com')).body;
    const asA = { Authorization: `Bearer ${a.token}` };
    const asB = { Authorization: `Bearer ${b.token}` };

    const post = (await request(app).post('/api/posts').set(asA).send({ text: 'Hello devs' })).body;
    expect(post.name).toBe('Ada');
    expect((await request(app).post('/api/posts').set(asA).send({ text: '' })).status).toBe(400);

    expect((await request(app).put(`/api/posts/like/${post._id}`).set(asB)).status).toBe(200);
    expect((await request(app).put(`/api/posts/like/${post._id}`).set(asB)).status).toBe(400);
    expect((await request(app).put(`/api/posts/unlike/${post._id}`).set(asB)).body).toHaveLength(0);

    const comments = (await request(app).post(`/api/posts/comment/${post._id}`).set(asB).send({ text: 'Nice' })).body;
    expect(comments).toHaveLength(1);
    expect((await request(app).delete(`/api/posts/comment/${post._id}/${comments[0]._id}`).set(asA)).body).toHaveLength(0); // post owner may remove

    expect((await request(app).delete(`/api/posts/${post._id}`).set(asB)).status).toBe(403);
    expect((await request(app).delete(`/api/posts/${post._id}`).set(asA)).status).toBe(200);
    expect((await request(app).get(`/api/posts/${post._id}`).set(asA)).status).toBe(404);
    expect((await request(app).get('/api/posts/not-an-id').set(asA)).status).toBe(400);
  });

  test('deleting an account removes its posts and profile', async () => {
    const a = (await register('Ada', 'ada@example.com')).body;
    const asA = { Authorization: `Bearer ${a.token}` };
    await request(app).post('/api/profile').set(asA).send({ status: 'Dev', skills: 'JS' });
    await request(app).post('/api/posts').set(asA).send({ text: 'bye' });
    expect((await request(app).delete('/api/profile').set(asA)).status).toBe(200);
    expect((await request(app).get('/api/auth/me').set(asA)).status).toBe(401);
    expect(await mongoose.connection.collection('posts').countDocuments()).toBe(0);
    expect(await mongoose.connection.collection('profiles').countDocuments()).toBe(0);
  });
});
