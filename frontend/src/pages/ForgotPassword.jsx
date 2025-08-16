import { useState } from 'react';
import { api } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      await api.post('/auth/forgot-password', { email });
      setMsg('If that email exists, we sent a reset link.');
    } catch (err) {
      setMsg('Something went wrong.');
    } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <h2>Forgot Password</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
        <button disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      {msg && <div className="alert">{msg}</div>}
    </div>
  );
}
