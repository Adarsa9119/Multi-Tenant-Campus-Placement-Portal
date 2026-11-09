const { hashPassword, isStrongPassword } = require('../utils/password');

async function ensureSuperAdmin({ User, email, name, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('SEED_SUPER_ADMIN_EMAIL must be a valid email address');
  }
  if (!isStrongPassword(password)) {
    throw new Error('SEED_DEMO_PASSWORD must contain 8-64 characters with upper, lower, digit, and special character');
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (user && user.role !== 'SUPER_ADMIN') {
    throw new Error('Configured admin email belongs to a non-admin account; no database changes were made');
  }

  const passwordHash = await hashPassword(password);
  if (user) {
    user.passwordHash = passwordHash;
    await user.save();
    return { created: false };
  }

  await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  });
  return { created: true };
}

async function run() {
  const env = require('../config/env');
  const connectDB = require('../config/db');
  const User = require('../models/User');

  try {
    await connectDB();
    const result = await ensureSuperAdmin({
      User,
      email: env.SEED_SUPER_ADMIN_EMAIL,
      name: env.SEED_SUPER_ADMIN_NAME,
      password: env.SEED_DEMO_PASSWORD,
    });
    console.log(result.created
      ? 'Super Admin account created; no other database records were changed.'
      : 'Super Admin password updated; no other database records were changed.');
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error('Super Admin setup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { ensureSuperAdmin };
