import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import Alert from '../../components/common/Alert.jsx';
import { isEmail } from '../../utils/validators.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!isEmail(email)) return setErr('Enter a valid email');
    setBusy(true);
    try { await authApi.forgotPassword({ email }); navigate(`/reset-password?email=${encodeURIComponent(email)}`); } catch (x) { setErr(errorMessage(x)); setBusy(false); }
    return undefined;
  };
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 40, minHeight: '70vh' }}>
      <form className="auth-card" style={{ width: 420 }} onSubmit={submit}>
        <h2>Forgot Password</h2><p className="sub">We will send a one-time code to your registered email.</p>
        <Alert>{err}</Alert>
        <div className="field"><label>Registered email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button className="btn btn-block" disabled={busy}>Send OTP</button>
        <p style={{ textAlign: 'center' }}><Link to="/login">Back to login</Link></p>
      </form>
    </div>
  );
}
