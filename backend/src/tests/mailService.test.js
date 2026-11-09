let env;
let mail;
let nodemailer;
let transport;

beforeEach(() => {
  jest.resetModules();
  jest.doMock('../config/env', () => ({
    NODE_ENV: 'development',
    SMTP_HOST: 'smtp.example.test',
    SMTP_PORT: 587,
    SMTP_SECURE: false,
    SMTP_USER: 'smtp-user',
    SMTP_PASS: 'smtp-pass',
    SMTP_FROM: 'Campus Portal <portal@example.test>',
    OTP_TTL_MINUTES: 5,
    CLIENT_URL: 'http://localhost:5173',
  }));
  jest.doMock('nodemailer', () => ({ createTransport: jest.fn() }));

  env = require('../config/env');
  nodemailer = require('nodemailer');
  transport = { sendMail: jest.fn().mockResolvedValue({ messageId: 'message-id' }) };
  nodemailer.createTransport.mockReturnValue(transport);
  mail = require('../services/mailService');
});

afterEach(() => {
  jest.dontMock('nodemailer');
  jest.restoreAllMocks();
});

describe('mail service OTP delivery', () => {
  test('rejects OTP delivery when SMTP is not configured', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    env.SMTP_HOST = '';

    await expect(mail.sendOtp('tpo@college.edu', '123456', 'LOGIN'))
      .rejects.toThrow('SMTP_HOST must be configured to send email');
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  test('sends the OTP to the exact registered account email', async () => {
    await mail.sendOtp('tpo@college.edu', '123456', 'LOGIN');

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.test',
      port: 587,
      secure: false,
      auth: { user: 'smtp-user', pass: 'smtp-pass' },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
    expect(transport.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'tpo@college.edu',
      from: 'Campus Portal <portal@example.test>',
      text: expect.stringContaining('123456'),
    }));
  });

  test('rejects incomplete SMTP credentials before connecting', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    env.SMTP_PASS = '';

    await expect(mail.sendOtp('tpo@college.edu', '123456', 'LOGIN'))
      .rejects.toThrow('SMTP_USER and SMTP_PASS must both be configured');
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });
});
