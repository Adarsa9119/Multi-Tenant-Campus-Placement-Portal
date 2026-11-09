const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const security = require('./src/config/security');
const requestLogger = require('./src/middleware/requestLogger');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);
app.use(helmet(security.helmet));
app.use(cors(security.cors));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());
app.use(requestLogger);
app.use('/api', generalLimiter);

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/college-registrations', require('./src/routes/collegeRegistrationRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/tenants', require('./src/routes/tenantRoutes'));
app.use('/api/tpo', require('./src/routes/tpoRoutes'));
app.use('/api/student', require('./src/routes/studentRoutes'));
app.use('/api/companies', require('./src/routes/companyRoutes'));
app.use('/api/college-companies', require('./src/routes/collegeCompanyRoutes'));
app.use('/api/recruiters', require('./src/routes/recruiterRoutes'));
app.use('/api/recruiter-authorizations', require('./src/routes/recruiterAuthorizationRoutes'));
app.use('/api/drives', require('./src/routes/placementDriveRoutes'));
app.use('/api/applications', require('./src/routes/applicationRoutes'));
app.use('/api/interviews', require('./src/routes/interviewRoutes'));
app.use('/api/offers', require('./src/routes/offerRoutes'));
app.use('/api/files', require('./src/routes/fileRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/audit-logs', require('./src/routes/auditRoutes'));
app.use('/api/security-alerts', require('./src/routes/securityAlertRoutes'));
app.use('/api/support', require('./src/routes/supportRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
