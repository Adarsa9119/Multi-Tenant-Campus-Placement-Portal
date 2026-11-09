import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import Alert from '../../components/common/Alert.jsx';
import DynamicForm from '../../components/forms/DynamicForm.jsx';
import useOtpCooldown from '../../hooks/useOtpCooldown.js';
import { isEmail, isStrongPassword, PASSWORD_HINT } from '../../utils/validators.js';

const FIELDS = [
  { name: 'name', label: 'Company Name', required: true }, { name: 'registrationType', label: 'Registration Type', type: 'select', options: ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Other'] },
  { name: 'registrationNo', label: 'CIN / Registration No.' }, { name: 'industry', label: 'Industry', required: true },
  { name: 'officialEmail', label: 'Official Email', type: 'email', required: true, validate: (v) => (isEmail(v) ? '' : 'Enter a valid email') }, { name: 'phone', label: 'Phone Number' },
  { name: 'website', label: 'Official Website', placeholder: 'https://' }, { name: 'city', label: 'City' }, { name: 'state', label: 'State' },
  { name: 'description', label: 'Company Description', type: 'textarea', full: true },
  { name: 'adminName', label: 'Company Admin Name', required: true },
  { name: 'designation', label: 'Designation' },
  { name: 'password', label: 'Password', type: 'password', required: true, help: PASSWORD_HINT, validate: (v) => (isStrongPassword(v) ? '' : PASSWORD_HINT) },
  { name: 'otp', label: '6-digit OTP', required: true, validate: (v) => (/^\d{6}$/.test(v) ? '' : 'Enter the 6-digit OTP') },
];

export default function CompanyRegistration() {
  const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [done, setDone] = useState(false); const [email, setEmail] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const { wait: otpWait, start: startOtpCooldown, startFromError: startOtpCooldownFromError } = useOtpCooldown();
  const sendOtp = async () => {
    setErr(''); setMsg('');
    if (!isEmail(email)) return setErr('Enter the company admin email below first');
    setOtpBusy(true);
    try {
      const response = await authApi.companySendOtp(email);
      startOtpCooldown(response.data.resendAfter);
      setMsg('OTP sent to the admin email.');
    } catch (e) { startOtpCooldownFromError(e); setErr(errorMessage(e)); } finally { setOtpBusy(false); }
    return undefined;
  };
  if (done) return <div className="center" style={{ padding: 80 }}><h2>✅ Company registered</h2><p>Your company is pending Super Admin verification. After verification, your recruiters are authorized separately and each college authorizes you for its campus.</p><Link className="btn" to="/login">Go to login</Link></div>;
  return (
    <div style={{ maxWidth: 880, margin: '28px auto', padding: '0 16px' }}>
      <div className="card card-pad">
        <h2>🏢 Company Registration</h2>
        <p style={{ color: 'var(--muted)' }}>Register your hiring organization. A company is verified by the platform first; recruiters are then authorized individually and each college must also authorize you.</p>
        <Alert>{err}</Alert><Alert type="success">{msg}</Alert>
        <div className="field"><label>Company admin email (OTP is sent here and becomes the login)</label><div style={{ display: 'flex', gap: 8 }}><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" /><button className="btn" onClick={sendOtp} disabled={otpBusy || otpWait > 0}>{otpBusy ? 'Sending…' : otpWait > 0 ? `Resend in ${otpWait}s` : 'Send OTP'}</button></div></div>
        <DynamicForm fields={FIELDS} submitLabel="Register Company" onSubmit={async (v) => {
          setErr('');
          try { if (!isEmail(email)) throw new Error('Enter the admin email at the top of the form'); await authApi.companyRegister({ ...v, adminEmail: email }); setDone(true); } catch (e) { setErr(errorMessage(e)); }
        }} />
      </div>
    </div>
  );
}
