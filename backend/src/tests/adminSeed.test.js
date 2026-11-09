const h = require('./setup');
const { ensureSuperAdmin } = require('../seeds/ensureSuperAdmin');
const { comparePassword, hashPassword } = require('../utils/password');

beforeAll(h.start);
afterAll(h.stop);
beforeEach(h.clear);

describe('non-destructive Super Admin setup', () => {
  test('creates or resets only the configured admin and preserves other records', async () => {
    const User = h.M('User');
    const other = await User.create({
      name: 'Existing Student',
      email: 'student@test.com',
      passwordHash: await hashPassword(h.PASSWORD),
      role: 'STUDENT',
      status: 'ACTIVE',
    });

    const config = {
      User,
      email: ' ADMIN@Test.com ',
      name: 'Platform Admin',
      password: 'Fresh@Pass99',
    };
    await expect(ensureSuperAdmin(config)).resolves.toEqual({ created: true });
    await expect(ensureSuperAdmin(config)).resolves.toEqual({ created: false });

    const admin = await User.findOne({ email: 'admin@test.com' }).select('+passwordHash');
    expect(admin.role).toBe('SUPER_ADMIN');
    await expect(comparePassword(config.password, admin.passwordHash)).resolves.toBe(true);
    expect(await User.findById(other._id)).toBeTruthy();
    expect(await User.countDocuments()).toBe(2);
  });

  test('refuses to promote a non-admin account sharing the configured email', async () => {
    const User = h.M('User');
    await User.create({
      name: 'Student',
      email: 'collision@test.com',
      passwordHash: await hashPassword(h.PASSWORD),
      role: 'STUDENT',
      status: 'ACTIVE',
    });

    await expect(ensureSuperAdmin({
      User,
      email: 'collision@test.com',
      name: 'Platform Admin',
      password: 'Fresh@Pass99',
    })).rejects.toThrow('non-admin account');
    expect(await User.countDocuments()).toBe(1);
  });
});
