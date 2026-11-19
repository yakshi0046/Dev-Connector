import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '../features/authSlice';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const action = await dispatch((isRegister ? register : login)(form));
    setBusy(false);
    if (action.meta.requestStatus === 'fulfilled') navigate('/dashboard');
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h1>{isRegister ? 'Create your account' : 'Sign in'}</h1>
      {isRegister && (
        <label>Name<input name="name" value={form.name} onChange={change} required autoComplete="name" /></label>
      )}
      <label>Email<input type="email" name="email" value={form.email} onChange={change} required autoComplete="email" /></label>
      <label>
        Password
        <input type="password" name="password" value={form.password} onChange={change} required minLength={isRegister ? 8 : undefined}
               autoComplete={isRegister ? 'new-password' : 'current-password'} />
        {isRegister && <small className="muted">At least 8 characters.</small>}
      </label>
      <button className="btn primary" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</button>
      <p className="muted">
        {isRegister ? <>Already registered? <Link to="/login">Sign in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}
      </p>
    </form>
  );
}
