const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./app');

(async () => {
  await connectDB();
  app.listen(env.PORT, () => console.log(`API running on http://localhost:${env.PORT} (${env.NODE_ENV})`));
})().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
