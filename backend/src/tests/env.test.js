describe('SMTP environment configuration', () => {
  const names = ['NODE_ENV', 'SMTP_USER', 'SMTP_PASS', 'SMTP_USERNAME', 'SMTP_PASSWORD'];
  const original = Object.fromEntries(names.map((name) => [name, process.env[name]]));

  afterEach(() => {
    jest.resetModules();
    for (const name of names) {
      if (original[name] === undefined) delete process.env[name];
      else process.env[name] = original[name];
    }
  });

  test('supports legacy SMTP username and password variable names', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    process.env.SMTP_USERNAME = 'smtp-user';
    process.env.SMTP_PASSWORD = 'smtp-pass';

    jest.isolateModules(() => {
      const env = require('../config/env');
      expect(env.SMTP_USER).toBe('smtp-user');
      expect(env.SMTP_PASS).toBe('smtp-pass');
    });
  });
});
