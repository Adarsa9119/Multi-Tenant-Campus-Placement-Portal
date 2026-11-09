import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import Alert from '../../components/common/Alert.jsx';
import OtpInput from '../../components/forms/OtpInput.jsx';
import { isStrongPassword, PASSWORD_HINT } from '../../utils/validators.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState(''); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (otp.length !== 6) return setErr('Enter the 6-digit OTP');
    if (!isStrongPassword(pw)) return setErr(`Password must be ${PASSWORD_HINT}`);
    if (pw !== pw2) return setErr('Passwords do not match');
    setBusy(true);
    try { await authApi.resetPassword({ email, otp, password: pw }); navigate('/login', { replace: true }); } catch (x) { setErr(errorMessage(x)); setBusy(false); }
    return undefined;
  };
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 40, minHeight: '70vh' }}>
      <form className="auth-card" style={{ width: 440 }} onSubmit={submit}>
        <h2>Reset Password</h2><p className="sub">Enter the OTP sent to {email || 'your email'} and choose a new password.</p>
        <Alert>{err}</Alert>
        <OtpInput value={otp} onChange={setOtp} />
        <div className="field"><label>New password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /><span className="help">{PASSWORD_HINT}</span></div>
        <div className="field"><label>Confirm password</label><input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
        <button className="btn btn-block" disabled={busy}>Reset password</button>
        <p style={{ textAlign: 'center' }}><Link to="/login">Back to login</Link></p>
      </form>
    </div>
  );
}
