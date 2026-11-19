import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { deleteAccount, deleteEntry, fetchMe } from '../features/profileSlice';
import { period } from '../format';

function Entries({ title, kind, items, primary, secondary }) {
  const dispatch = useDispatch();
  if (!items.length) return null;
  return (
    <section>
      <h2>{title}</h2>
      <ul className="list">
        {items.map((e) => (
          <li key={e._id} className="card entry">
            <div>
              <strong>{primary(e)}</strong>
              <div className="muted">{secondary(e)}</div>
              <div className="muted">{period(e)}</div>
            </div>
            <button type="button" className="btn danger" onClick={() => dispatch(deleteEntry({ kind, id: e._id }))}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { me, meLoaded } = useSelector((s) => s.profile);

  useEffect(() => { dispatch(fetchMe()); }, [dispatch]);

  const removeAccount = async () => {
    if (!window.confirm('Delete your account, profile and posts? This cannot be undone.')) return;
    const action = await dispatch(deleteAccount());
    if (action.meta.requestStatus === 'fulfilled') {
      dispatch(logout());
      navigate('/');
    }
  };

  if (!meLoaded) return <p className="muted">Loading…</p>;
  return (
    <>
      <h1>Dashboard</h1>
      <p className="lead">Welcome, {user?.name}.</p>
      {!me ? (
        <div className="card">
          <p>You have not set up a profile yet. Add a few details so other developers can find you.</p>
          <Link className="btn primary" to="/edit-profile">Create profile</Link>
        </div>
      ) : (
        <>
          <div className="row wrap">
            <Link className="btn" to="/edit-profile">Edit profile</Link>
            <Link className="btn" to="/add-experience">Add experience</Link>
            <Link className="btn" to="/add-education">Add education</Link>
            <Link className="btn" to={`/profile/${me.user._id}`}>View public profile</Link>
          </div>
          <Entries title="Experience" kind="experience" items={me.experience} primary={(e) => e.title} secondary={(e) => e.company} />
          <Entries title="Education" kind="education" items={me.education} primary={(e) => e.school} secondary={(e) => [e.degree, e.fieldOfStudy].filter(Boolean).join(', ')} />
        </>
      )}
      <hr />
      <button type="button" className="btn danger" onClick={removeAccount}>Delete my account</button>
    </>
  );
}
