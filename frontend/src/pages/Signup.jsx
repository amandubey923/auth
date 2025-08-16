import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      await signup(form.name, form.email, form.password);
      setMsg('Signup successful — redirecting to dashboard…');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Error during signup');
    } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <h2>Signup</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
        <label>Email</label>
        <input name="email" value={form.email} onChange={onChange} type="email" placeholder="you@example.com" required />
        <label>Password</label>
        <input name="password" value={form.password} onChange={onChange} type="password" placeholder="min 6 chars" minLength={6} required />
        <button disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      {msg && <div className="alert">{msg}</div>}
    </div>
  );
}
