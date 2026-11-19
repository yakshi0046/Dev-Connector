import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addEntry } from '../features/profileSlice';

const FIELDS = {
  experience: { title: 'Add experience', fields: [['title', 'Job title', true], ['company', 'Company', true], ['location', 'Location', false]] },
  education: { title: 'Add education', fields: [['school', 'School', true], ['degree', 'Degree', true], ['fieldOfStudy', 'Field of study', false]] },
};

export default function EntryForm({ kind }) {
  const { title, fields } = FIELDS[kind];
  const [form, setForm] = useState({ from: '', to: '', current: false, description: '' });
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const action = await dispatch(addEntry({ kind, form }));
    setBusy(false);
    if (action.meta.requestStatus === 'fulfilled') navigate('/dashboard');
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h1>{title}</h1>
      {fields.map(([name, label, required]) => (
        <label key={name}>{label}<input name={name} value={form[name] || ''} onChange={change} required={required} /></label>
      ))}
      <div className="row">
        <label>From<input type="date" name="from" value={form.from} onChange={change} required /></label>
        <label>To<input type="date" name="to" value={form.to} onChange={change} disabled={form.current} /></label>
      </div>
      <label className="check"><input type="checkbox" name="current" checked={form.current} onChange={change} /> I am here now</label>
      <label>Description<textarea name="description" rows="3" value={form.description} onChange={change} /></label>
      <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
