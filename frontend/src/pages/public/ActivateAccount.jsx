import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import Alert from '../../components/common/Alert.jsx';
import OtpInput from '../../components/forms/OtpInput.jsx';
import { isEmail, isStrongPassword, PASSWORD_HINT } from '../../utils/validators.js';

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(''); const [otp, setOtp] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const request = async (e) => {
    e.preventDefault(); setErr('');
    if (!isEmail(email)) return setErr('Enter the email address your institution registered');
    setBusy(true);
    try { await authApi.requestActivation({ email }); setMsg('If an invitation exists for this email, an OTP has been sent.'); setStep(2); } catch (x) { setErr(errorMessage(x)); } finally { setBusy(false); }
    return undefined;
  };
  const activate = async (e) => {
    e.preventDefault(); setErr('');
    if (otp.length !== 6) return setErr('Enter the 6-digit OTP');
    if (!isStrongPassword(pw)) return setErr(`Password must be ${PASSWORD_HINT}`);
    if (pw !== pw2) return setErr('Passwords do not match');
    setBusy(true);
    try { await authApi.activate({ email, otp, password: pw }); navigate('/login', { replace: true }); } catch (x) { setErr(errorMessage(x)); } finally { setBusy(false); }
    return undefined;
  };
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 40, minHeight: '70vh' }}>
      <div className="auth-card" style={{ width: 440 }}>
        <h2>Activate Account</h2><p className="sub">Accounts are created by your college (TPO), Super Admin or company. Verify your email to set a password.</p>
        <Alert>{err}</Alert><Alert type="success">{msg}</Alert>
        {step === 1 ? (
          <form onSubmit={request}><div className="field"><label>Registered email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div><button className="btn btn-block" disabled={busy}>Send OTP</button></form>
        ) : (
          <form onSubmit={activate}>
            <label style={{ fontWeight: 600 }}>OTP sent to {email}</label><OtpInput value={otp} onChange={setOtp} />
            <div className="field"><label>New password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /><span className="help">{PASSWORD_HINT}</span></div>
            <div className="field"><label>Confirm password</label><input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
            <button className="btn btn-block" disabled={busy}>Activate account</button>
          </form>
        )}
        <p style={{ textAlign: 'center' }}><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}
