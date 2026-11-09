import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import useAuth from '../../hooks/useAuth.js';
import Alert from '../../components/common/Alert.jsx';
import OtpInput from '../../components/forms/OtpInput.jsx';
import { ROLE_HOME } from '../../constants/roles.js';
import { isEmail } from '../../utils/validators.js';
import useOtpCooldown from '../../hooks/useOtpCooldown.js';

const ROLES = [['SUPER_ADMIN', '⚙️', 'Super Admin'], ['TPO', '🏛️', 'TPO'], ['RECRUITER', '👥', 'Recruiter'], ['STUDENT', '🎓', 'Student']];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [step, setStep] = useState('credentials');
  const [masked, setMasked] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const { wait, start: startOtpCooldown, startFromError: startOtpCooldownFromError } = useOtpCooldown();

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!role) return setError('Select the role assigned to your account. For the platform administrator account, choose Super Admin.');
    if (!isEmail(form.email)) return setError('Enter a valid email address');
    if (!form.password) return setError('Enter your password');
    setBusy(true);
    try {
      const res = await authApi.login({ ...form, role });
      setDeliveryMessage('A verification code has been sent to your registered email.');
      setMasked(res.data.maskedEmail); startOtpCooldown(res.data.resendAfter); setStep('otp');
    } catch (err) {
      const message = errorMessage(err);
      setError(err.response?.status === 401
        ? `${message}. Make sure the selected role matches your account; for the platform administrator account, choose Super Admin.`
        : message);
    } finally { setBusy(false); }
    return undefined;
  };
  const verify = async () => {
    setError('');
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setBusy(true);
    try {
      const res = await authApi.verifyOtp({ email: form.email, otp });
      login(res.data.token, res.data.user);
      navigate(location.state?.from || ROLE_HOME[res.data.user.role], { replace: true });
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  };
  const resend = async () => {
    setError('');
    setResendBusy(true);
    try { await authApi.resendOtp({ email: form.email, purpose: 'LOGIN' }); startOtpCooldown(); setOtp(''); } catch (err) { startOtpCooldownFromError(err); setError(errorMessage(err)); } finally { setResendBusy(false); }
  };

  return (
    <div className="login-page">
      <section className="auth-card">
        <div className="auth-tabs"><div className={step === 'credentials' ? 'on' : ''}>Login</div><div className={step === 'otp' ? 'on' : ''}>Verify OTP</div></div>
        <h2>Sign In to Your Account</h2>
        <p className="sub">Access your dashboard based on your role</p>
        <Alert>{error}</Alert>
        <form onSubmit={submit} noValidate>
          <div className="field"><label>Select Your Role</label>
            <div className="role-pick">{ROLES.map(([k, ic, l]) => <button type="button" key={k} className={role === k ? 'on' : ''} onClick={() => { setRole(k); setError(''); }} disabled={step === 'otp'}><span>{ic}</span>{l}</button>)}</div>
          </div>
          <div className="field"><label htmlFor="email">Email Address</label><input id="email" type="email" placeholder="Enter your registered email" value={form.email} disabled={step === 'otp'} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="username" /></div>
          <div className="field"><label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" type={show ? 'text' : 'password'} placeholder="Enter your password" value={form.password} disabled={step === 'otp'} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 0 }} aria-label="Show password">{show ? '🙈' : '👁️'}</button>
            </div>
            <div style={{ textAlign: 'right' }}><Link to="/forgot-password">Forgot Password?</Link></div>
          </div>
          <button className="btn btn-lg btn-block" disabled={busy || step === 'otp'}>{busy && step === 'credentials' ? 'Checking…' : '➜ Sign In'}</button>
        </form>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>First time here? <Link to="/activate">Activate your account</Link> · <Link to="/register-college">Register a college</Link> · <Link to="/register-company">Register a company</Link></p>
      </section>

      <section className="auth-card" style={{ opacity: step === 'otp' ? 1 : .6 }}>
        <div style={{ textAlign: 'center', fontSize: 54 }}>✉️</div>
        <h2 style={{ fontSize: 22 }}>Verify Your Email (OTP)</h2>
        <p className="sub">{deliveryMessage || 'Sign in to receive a verification code.'}</p>
        {masked && <div className="masked">✉️ {masked}</div>}
        <label style={{ fontWeight: 600 }}>Enter 6-Digit OTP</label>
        <OtpInput value={otp} onChange={setOtp} />
        <button className="btn btn-lg btn-block" onClick={verify} disabled={step !== 'otp' || busy}>🛡️ Verify OTP</button>
        <p style={{ textAlign: 'center', color: 'var(--muted)' }}>Didn't receive the OTP?<br />
          {wait > 0 ? <>Resend OTP in <b style={{ color: 'var(--primary)' }}>00:{String(wait).padStart(2, '0')}</b></> : <button className="btn btn-light btn-sm" onClick={resend} disabled={step !== 'otp' || resendBusy}>{resendBusy ? 'Sending…' : 'Resend OTP'}</button>}
        </p>
      </section>
    </div>
  );
}
