import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMe, saveProfile } from '../features/profileSlice';

const STATUSES = ['Developer', 'Senior Developer', 'Junior Developer', 'Manager', 'Student', 'Instructor', 'Intern', 'Other'];
const EMPTY = { status: '', company: '', website: '', location: '', skills: '', githubUsername: '', bio: '' };

export default function ProfileForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { me, meLoaded } = useSelector((s) => s.profile);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => { dispatch(fetchMe()); }, [dispatch]);
  useEffect(() => {
    if (me) setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(me).filter(([k, v]) => k in EMPTY && v)), skills: me.skills.join(', ') });
  }, [me]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const action = await dispatch(saveProfile(form));
    setBusy(false);
    if (action.meta.requestStatus === 'fulfilled') navigate('/dashboard');
  };

  if (!meLoaded) return <p className="muted">Loading…</p>;
  return (
    <form className="card form" onSubmit={submit}>
      <h1>{me ? 'Edit your profile' : 'Create your profile'}</h1>
      <label>
        Professional status
        <select name="status" value={form.status} onChange={change} required>
          <option value="">Select…</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label>Company<input name="company" value={form.company} onChange={change} /></label>
      <label>Website<input name="website" type="url" placeholder="https://" value={form.website} onChange={change} /></label>
      <label>Location<input name="location" value={form.location} onChange={change} /></label>
      <label>
        Skills
        <input name="skills" value={form.skills} onChange={change} required placeholder="Node.js, React, MongoDB" />
        <small className="muted">Separate skills with commas.</small>
      </label>
      <label>
        GitHub username
        <input name="githubUsername" value={form.githubUsername} onChange={change} />
        <small className="muted">Your latest repositories appear on your profile.</small>
      </label>
      <label>Short bio<textarea name="bio" rows="4" value={form.bio} onChange={change} /></label>
      <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}
