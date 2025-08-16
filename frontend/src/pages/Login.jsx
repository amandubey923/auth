import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Invalid credentials');
    } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>Email</label>
        <input name="email" value={form.email} onChange={onChange} type="email" placeholder="you@example.com" required />
        <label>Password</label>
        <input name="password" value={form.password} onChange={onChange} type="password" placeholder="••••••••" required />
        <button disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      </form>
      {msg && <div className="alert">{msg}</div>}
      <div className="hint"><Link to="/forgot-password">Forgot password?</Link></div>
    </div>
  );
}
