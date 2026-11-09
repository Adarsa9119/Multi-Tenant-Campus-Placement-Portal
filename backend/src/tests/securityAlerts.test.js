const h = require('./setup');
const mail = require('../services/mailService');

let w;
beforeAll(async () => { await h.start(); jest.spyOn(mail, 'sendOtp').mockResolvedValue(); });
afterAll(h.stop);
beforeEach(async () => { await h.clear(); w = await h.world(); });

describe('rule-based security alerts', () => {
  test('repeated failed logins raise an alert', async () => {
    for (let i = 0; i < 5; i += 1) await h.request(h.app).post('/api/auth/login').send({ email: 'tpo1@test.com', password: 'Bad@12345' });
    const alert = await h.M('SecurityAlert').findOne({ eventType: 'MULTIPLE_FAILED_LOGINS' });
    expect(alert).toBeTruthy();
    expect(alert.severity).toBe('HIGH');
  });
  test('repeated wrong OTPs raise an alert', async () => {
    await h.request(h.app).post('/api/auth/login').send({ email: 'tpo1@test.com', password: h.PASSWORD });
    for (let i = 0; i < 5; i += 1) await h.request(h.app).post('/api/auth/verify-otp').send({ email: 'tpo1@test.com', otp: '000000' });
    expect(await h.M('SecurityAlert').countDocuments({ eventType: 'SUSPICIOUS_OTP_ACTIVITY' })).toBe(1);
  });
  test('repeated unauthorized requests raise an alert', async () => {
    for (let i = 0; i < 5; i += 1) await h.request(h.app).get('/api/admin/tenants').set(h.auth(w.tpo1));
    expect(await h.M('SecurityAlert').countDocuments({ eventType: 'REPEATED_UNAUTHORIZED_REQUESTS' })).toBe(1);
  });
  test('super admin can list and resolve alerts; TPO only sees own tenant', async () => {
    await h.request(h.app).get(`/api/tpo/students/${w.s2.s._id}`).set(h.auth(w.tpo1));
    const list = await h.request(h.app).get('/api/security-alerts').set(h.auth(w.admin));
    expect(list.body.data.length).toBeGreaterThan(0);
    const id = list.body.data[0]._id;
    expect((await h.request(h.app).post(`/api/security-alerts/${id}/status`).set(h.auth(w.admin)).send({ status: 'RESOLVED' })).status).toBe(200);
    const mine = await h.request(h.app).get('/api/security-alerts').set(h.auth(w.tpo2));
    expect(mine.body.data).toHaveLength(0);
  });
});
