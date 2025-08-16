import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMsg('Password reset successful. Redirecting to login…');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Invalid or expired token');
    } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <h2>Reset Password</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>New password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="New password" minLength={6} required />
        <button disabled={busy}>{busy ? 'Resetting…' : 'Reset password'}</button>
      </form>
      {msg && <div className="alert">{msg}</div>}
    </div>
  );
}
