import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProfiles } from '../features/profileSlice';

export default function Profiles() {
  const dispatch = useDispatch();
  const { list, listLoaded } = useSelector((s) => s.profile);
  useEffect(() => { dispatch(fetchProfiles()); }, [dispatch]);

  if (!listLoaded) return <p className="muted">Loading developers…</p>;
  return (
    <>
      <h1>Developers</h1>
      {list.length === 0 ? (
        <p className="muted">No profiles yet. Be the first to create one.</p>
      ) : (
        <ul className="list">
          {list.map((p) => (
            <li key={p._id} className="card person">
              <img src={p.user.avatar} alt="" width="72" height="72" loading="lazy" />
              <div>
                <h2><Link to={`/profile/${p.user._id}`}>{p.user.name}</Link></h2>
                <p className="muted">{[p.status, p.company && `at ${p.company}`, p.location].filter(Boolean).join(' · ')}</p>
                <p className="tags">{p.skills.slice(0, 5).map((s) => <span key={s}>{s}</span>)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
