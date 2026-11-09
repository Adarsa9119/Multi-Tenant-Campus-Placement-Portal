import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { errorMessage } from '../../api/axiosClient.js';
import Alert from '../../components/common/Alert.jsx';
import { COLLEGE_TYPES, STATES } from '../../constants/statuses.js';
import useOtpCooldown from '../../hooks/useOtpCooldown.js';
import { isEmail, isPhone, isPincode } from '../../utils/validators.js';

const EMPTY = { collegeName: '', collegeCode: '', affiliation: '', collegeType: '', officialEmail: '', website: '', address: '', city: '', state: '', pincode: '', contactName: '', contactEmail: '', contactPhone: '', contactDesignation: '', tpoName: '', tpoEmail: '', tpoPhone: '', tpoDesignation: 'Training & Placement Officer', otp: '', confirm: false };
const DRAFT = 'cp_college_draft';
const PROCESS = [['Submit Registration', 'Fill and submit the college registration form with official details.'], ['Pending Approval', 'Your request will be reviewed by the Super Admin team.'], ['Approval / Rejection', 'You will be notified about the approval status via email.'], ['Tenant Creation', 'Once approved, a unique tenant will be created for your college.'], ['Assign TPO', 'The proposed TPO will be verified and granted access to the college tenant.'], ['Activate College', 'After verification, your college will be activated on the platform.']];

export default function CollegeRegistration() {
  const [f, setF] = useState(() => { try { return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(DRAFT)) }; } catch { return EMPTY; } });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [done, setDone] = useState(false); const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);
  const [settingsFailed, setSettingsFailed] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const { wait: otpWait, start: startOtpCooldown, startFromError: startOtpCooldownFromError } = useOtpCooldown();
  useEffect(() => {
    authApi.collegeSettings()
      .then((r) => setOpen(r.data.allowCollegeRegistration))
      .catch((e) => { setErr(`Unable to check college registration status: ${errorMessage(e)}`); setSettingsFailed(true); });
  }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    ['collegeName', 'affiliation', 'collegeType', 'address', 'city', 'state', 'contactName', 'contactDesignation', 'tpoName'].forEach((k) => { if (!f[k].trim()) e[k] = 'Required'; });
    ['officialEmail', 'contactEmail', 'tpoEmail'].forEach((k) => { if (!isEmail(f[k])) e[k] = 'Enter a valid email'; });
    ['contactPhone', 'tpoPhone'].forEach((k) => { if (!isPhone(f[k])) e[k] = 'Enter a 10 digit mobile number'; });
    if (!isPincode(f.pincode)) e.pincode = 'Enter a 6 digit pincode';
    if (!/^\d{6}$/.test(f.otp)) e.otp = 'Enter the 6 digit OTP sent to the official email';
    if (!f.confirm) e.confirm = 'Please accept the declaration';
    setErrors(e);
    return !Object.keys(e).length;
  };
  const sendOtp = async () => {
    setErr(''); setMsg('');
    if (!isEmail(f.officialEmail)) return setErrors({ officialEmail: 'Enter a valid official email first' });
    setOtpBusy(true);
    try {
      const response = await authApi.collegeSendOtp(f.officialEmail);
      startOtpCooldown(response.data.resendAfter);
      setMsg('OTP sent to the official college email.');
    } catch (e) { startOtpCooldownFromError(e); setErr(errorMessage(e)); } finally { setOtpBusy(false); }
    return undefined;
  };
  const submit = async () => {
    setErr(''); setMsg('');
    if (!validate()) return setErr('Please correct the highlighted fields');
    setBusy(true);
    try { await authApi.collegeRegister({ ...f, confirm: 'true' }); sessionStorage.removeItem(DRAFT); setDone(true); } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); }
    return undefined;
  };
  const inp = (k, label, props = {}, req = true) => (
    <div className="field"><label>{label}{req && <span className="req"> *</span>}</label><input value={f[k]} onChange={set(k)} {...props} />{errors[k] && <span className="err">{errors[k]}</span>}</div>
  );

  if (done) return <div className="center" style={{ padding: 80 }}><h2>✅ Registration submitted</h2><p>Your request is pending Super Admin review. You will be notified by email once it is approved or rejected.</p><Link className="btn" to="/">Back to home</Link></div>;
  return (
    <div className="reg-page">
      <aside className="reg-steps">
        <h2>College Registration</h2><p style={{ color: 'var(--muted)' }}>Register your college to join the placement network. Approval is required before activation.</p>
        {[['College Details', 'Basic information about your college'], ['Contact & TPO', 'Authorized contact and TPO details'], ['Review & Submit', 'Review all information'], ['Pending Approval', 'Verification by Super Admin']].map(([t, d], i) => <div key={t} className={`st ${i === 0 ? 'on' : ''}`}><i>{i + 1}</i><div><b>{t}</b><small>{d}</small></div></div>)}
      </aside>
      <section className="card card-pad">
        <h2 style={{ fontSize: 26 }}>🏛️ College Registration</h2>
        <p style={{ color: 'var(--muted)' }}>Provide your college details to request onboarding. Your registration will be reviewed by the Super Admin team.</p>
        {open === false && !settingsFailed && <Alert type="warn">College registration is currently closed by the platform administrator.</Alert>}
        <Alert>{err}</Alert><Alert type="success">{msg}</Alert>
        <div className="sec-title">1. College Details</div>
        <div className="form-grid">
          {inp('collegeName', 'College Name', { placeholder: 'Enter full college name' })}{inp('collegeCode', 'College Code (if any)', { placeholder: 'e.g. C001' }, false)}
          {inp('affiliation', 'University / Affiliation', { placeholder: 'Enter university or affiliation name' })}
          <div className="field" style={{ gridRow: 'span 2' }}><label>Address<span className="req"> *</span></label><textarea rows={5} value={f.address} onChange={set('address')} placeholder="Enter complete address" />{errors.address && <span className="err">{errors.address}</span>}</div>
          <div className="field"><label>College Type<span className="req"> *</span></label><select value={f.collegeType} onChange={set('collegeType')}><option value="">Select college type</option>{COLLEGE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>{errors.collegeType && <span className="err">{errors.collegeType}</span>}</div>
          {inp('officialEmail', 'Official Email', { type: 'email', placeholder: 'college@institution.edu.in' })}
          <div className="form-grid" style={{ gap: '0 12px' }}>{inp('city', 'City', { placeholder: 'Enter city' })}
            <div className="field"><label>State<span className="req"> *</span></label><select value={f.state} onChange={set('state')}><option value="">Select state</option>{STATES.map((t) => <option key={t}>{t}</option>)}</select>{errors.state && <span className="err">{errors.state}</span>}</div></div>
          {inp('website', 'Official Website', { placeholder: 'https://www.yourcollege.edu.in' }, false)}{inp('pincode', 'Pincode', { placeholder: 'Enter pincode', maxLength: 6 })}
        </div>
        <div className="sec-title">2. Contact Person &amp; TPO Details</div>
        <div className="form-grid">
          {inp('contactName', 'Contact Person Name', { placeholder: 'Enter contact person name' })}{inp('tpoName', 'Proposed TPO Name', { placeholder: 'Enter TPO name' })}
          {inp('contactEmail', 'Contact Email', { type: 'email', placeholder: 'contact@yourcollege.edu.in' })}{inp('tpoEmail', 'Proposed TPO Official Email', { type: 'email', placeholder: 'tpo@yourcollege.edu.in' })}
          {inp('contactPhone', 'Contact Phone', { placeholder: 'Enter 10 digit mobile number', maxLength: 10 })}{inp('tpoPhone', 'Proposed TPO Phone', { placeholder: 'Enter 10 digit mobile number', maxLength: 10 })}
          {inp('contactDesignation', 'Designation', { placeholder: 'e.g. Principal, Director' })}{inp('tpoDesignation', 'TPO Designation')}
        </div>
        <div className="sec-title">✉️ 3. Email Verification</div>
        <p style={{ margin: '0 0 8px' }}>We will send an OTP to the official college email to verify your identity.</p>
        <div style={{ display: 'flex', gap: 10, maxWidth: 480 }}><input style={{ flex: 1, padding: 10, border: '1px solid #ccd6e6', borderRadius: 8 }} placeholder="Enter OTP" maxLength={6} value={f.otp} onChange={set('otp')} /><button className="btn" onClick={sendOtp} disabled={!open || otpBusy || otpWait > 0}>{otpBusy ? 'Sending…' : otpWait > 0 ? `Resend in ${otpWait}s` : 'Send OTP'}</button></div>
        {errors.otp && <span className="err" style={{ color: 'var(--red)', fontSize: 12 }}>{errors.otp}</span>}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 18 }}>
          <label className="check-row" style={{ flex: 1 }}><input type="checkbox" checked={f.confirm} onChange={set('confirm')} /> I confirm that the information provided is accurate and I am authorized to register this college. I understand that my registration is subject to verification and approval by the Super Admin team.</label>
          <button className="btn btn-outline" onClick={() => { sessionStorage.setItem(DRAFT, JSON.stringify({ ...f, otp: '', confirm: false })); setMsg('Draft saved in this browser tab.'); }}>Save Draft</button>
          <button className="btn" onClick={submit} disabled={busy || !open}>{busy ? 'Submitting…' : 'Submit Registration'}</button>
        </div>
        {errors.confirm && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.confirm}</span>}
      </section>
      <aside>
        <div className="card card-pad process">
          <h3 style={{ marginBottom: 14 }}>⚙️ Registration Process</h3>
          {PROCESS.map(([t, d], i) => <div className="p" key={t}><i>{i + 1}</i><div><b>{t}</b><small>{d}</small></div></div>)}
        </div>
        <div className="green-box"><h3>✔ Important Information</h3><ul><li>You cannot choose or create a tenant yourself.</li><li>Each college gets a unique tenant after Super Admin approval.</li><li>All information will be verified for authenticity.</li><li>Only authorized colleges will be activated.</li><li>You will be notified at every step via email.</li></ul></div>
      </aside>
    </div>
  );
}
