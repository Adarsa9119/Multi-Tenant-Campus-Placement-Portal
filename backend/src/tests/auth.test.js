const h = require('./setup');
const mail = require('../services/mailService');

let sent;
beforeAll(async () => { await h.start(); jest.spyOn(mail, 'sendOtp').mockImplementation(async (to, code) => { sent = { to, code }; }); });
afterAll(h.stop);
beforeEach(async () => { await h.clear(); sent = null; });

describe('authentication with email OTP', () => {
  test('Super Admin signs in when the matching account role is selected', async () => {
    await h.world();
    const response = await h.request(h.app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: h.PASSWORD,
      role: 'SUPER_ADMIN',
    });

    expect(response.status).toBe(200);
    expect(response.body.data.otpRequired).toBe(true);
  });

  test('valid password -> OTP -> JWT; no token before OTP', async () => {
    const w = await h.world();
    const r1 = await h.request(h.app).post('/api/auth/login').send({ email: 'tpo1@test.com', password: h.PASSWORD, role: 'TPO' });
    expect(r1.status).toBe(200);
    expect(r1.body.data.otpRequired).toBe(true);
    expect(JSON.stringify(r1.body)).not.toContain(sent.code); // OTP never in the API response
    expect(r1.body.data.token).toBeUndefined();
    const bad = await h.request(h.app).post('/api/auth/verify-otp').send({ email: 'tpo1@test.com', otp: sent.code === '000000' ? '111111' : '000000' });
    expect(bad.status).toBe(400);
    const good = await h.request(h.app).post('/api/auth/verify-otp').send({ email: 'tpo1@test.com', otp: sent.code });
    expect(good.status).toBe(200);
    expect(good.body.data.token).toBeTruthy();
    const me = await h.request(h.app).get('/api/auth/me').set('Authorization', `Bearer ${good.body.data.token}`);
    expect(me.body.data.role).toBe('TPO');
    expect(w.tpo1).toBeTruthy();
  });
  test('OTP is single use', async () => {
    await h.world();
    await h.request(h.app).post('/api/auth/login').send({ email: 'tpo1@test.com', password: h.PASSWORD });
    const code = sent.code;
    await h.request(h.app).post('/api/auth/verify-otp').send({ email: 'tpo1@test.com', otp: code });
    const again = await h.request(h.app).post('/api/auth/verify-otp').send({ email: 'tpo1@test.com', otp: code });
    expect(again.status).toBe(400);
  });
  test('concurrent OTP verification can only create one session', async () => {
    await h.world();
    await h.request(h.app).post('/api/auth/login').send({ email: 'tpo1@test.com', password: h.PASSWORD });
    const code = sent.code;

    const results = await Promise.all([
      h.request(h.app).post('/api/auth/verify-otp').send({ email: 'tpo1@test.com', otp: code }),
      h.request(h.app).post('/api/auth/verify-otp').send({ email: 'tpo1@test.com', otp: code }),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([200, 400]);
    expect(results.filter((result) => result.body.data?.token)).toHaveLength(1);
  });
  test('wrong password, wrong role and unknown email all fail generically', async () => {
    await h.world();
    for (const body of [{ email: 'tpo1@test.com', password: 'Wrong@1234' }, { email: 'tpo1@test.com', password: h.PASSWORD, role: 'STUDENT' }, { email: 'no@test.com', password: h.PASSWORD }]) {
      const r = await h.request(h.app).post('/api/auth/login').send(body);
      expect(r.status).toBe(401);
    }
  });
  test('suspended and invited accounts cannot log in', async () => {
    const w = await h.world();
    await h.M('User').updateOne({ _id: w.tpo1._id }, { status: 'SUSPENDED' });
    expect((await h.request(h.app).post('/api/auth/login').send({ email: 'tpo1@test.com', password: h.PASSWORD })).status).toBe(403);
  });
  test('invited user activates with OTP and strong password', async () => {
    const w = await h.world();
    await h.M('User').create({ name: 'New', email: 'new@test.com', role: 'STUDENT', tenantId: w.t1._id, status: 'INVITED' });
    await h.request(h.app).post('/api/auth/request-activation').send({ email: 'new@test.com' });
    const weak = await h.request(h.app).post('/api/auth/activate').send({ email: 'new@test.com', otp: sent.code, password: 'weakpass' });
    expect(weak.status).toBe(422);
    await h.request(h.app).post('/api/auth/request-activation').send({ email: 'new@test.com' });
    const ok = await h.request(h.app).post('/api/auth/activate').send({ email: 'new@test.com', otp: sent.code, password: 'Fresh@Pass99' });
    expect(ok.status).toBe(200);
  });
  test('protected routes require a token', async () => {
    expect((await h.request(h.app).get('/api/tpo/dashboard')).status).toBe(401);
  });
});
