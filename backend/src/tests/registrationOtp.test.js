jest.mock('../models/Otp', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  create: jest.fn(),
  deleteOne: jest.fn(),
}));
jest.mock('../services/mailService', () => ({ sendOtp: jest.fn() }));
jest.mock('../services/auditService', () => ({ log: jest.fn() }));

const Otp = require('../models/Otp');
const mail = require('../services/mailService');
const audit = require('../services/auditService');
const otp = require('../services/otpService');

let sent;

beforeEach(async () => {
  sent = null;
  jest.clearAllMocks();
  Otp.findOne.mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });
  Otp.findOneAndUpdate.mockResolvedValue(null);
  Otp.updateOne.mockResolvedValue({});
  Otp.updateMany.mockResolvedValue({});
  Otp.create.mockResolvedValue({ _id: 'otp-id' });
  Otp.deleteOne.mockResolvedValue({ deletedCount: 1 });
  audit.log.mockResolvedValue({});
  mail.sendOtp.mockImplementation(async (to, code, purpose) => {
    sent = { to, code, purpose };
    return { delivery: 'email' };
  });
});

describe('college registration OTP delivery', () => {
  test('reports email delivery without returning the OTP', async () => {
    const response = await otp.issue({ email: ' College@Example.edu ', purpose: 'COLLEGE_REGISTRATION' });

    expect(sent).toMatchObject({ to: 'college@example.edu', purpose: 'COLLEGE_REGISTRATION' });
    expect(response.delivery).toBe('email');
    expect(JSON.stringify(response)).not.toContain(sent.code);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({}),
      'OTP_SENT',
      'Otp',
      'otp-id',
      expect.objectContaining({ email: 'college@example.edu', purpose: 'COLLEGE_REGISTRATION', delivery: 'email' }),
    );
  });

  test('removes an undelivered OTP so a mail failure does not block a retry', async () => {
    mail.sendOtp
      .mockRejectedValueOnce(new Error('SMTP unavailable'))
      .mockResolvedValueOnce({ delivery: 'email' });

    await expect(otp.issue({ email: 'college@example.edu', purpose: 'COLLEGE_REGISTRATION' }))
      .rejects.toThrow('SMTP unavailable');
    expect(Otp.deleteOne).toHaveBeenCalledWith({ _id: 'otp-id' });

    const retried = await otp.issue({ email: 'college@example.edu', purpose: 'COLLEGE_REGISTRATION' });

    expect(retried.delivery).toBe('email');
  });

  test('claims a valid OTP with a conditional atomic update', async () => {
    const record = { _id: 'otp-id', userId: 'user-id', status: 'USED' };
    Otp.findOneAndUpdate.mockResolvedValue(record);

    await expect(otp.verify({ email: 'college@example.edu', purpose: 'COLLEGE_REGISTRATION', code: '123456' }))
      .resolves.toBe(record);
    expect(Otp.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'college@example.edu',
        purpose: 'COLLEGE_REGISTRATION',
        status: 'PENDING',
        attempts: expect.objectContaining({ $lt: expect.any(Number) }),
        codeHash: expect.any(String),
      }),
      { $set: { status: 'USED' } },
      { new: true },
    );
    expect(Otp.findOne).not.toHaveBeenCalled();
  });

  test('does not accept an OTP if another verification already claimed it', async () => {
    Otp.findOneAndUpdate.mockResolvedValue(null);
    Otp.findOne.mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });

    await expect(otp.verify({ email: 'college@example.edu', purpose: 'COLLEGE_REGISTRATION', code: '123456' }))
      .rejects.toThrow('Invalid or expired OTP');
    expect(audit.log).toHaveBeenCalledWith(
      expect.any(Object),
      'OTP_FAILED',
      'Otp',
      undefined,
      expect.objectContaining({ reason: 'no_pending_otp' }),
    );
  });
});
