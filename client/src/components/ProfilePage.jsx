import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchProfile, fetchRepos } from '../features/profileSlice';
import { period } from '../format';

export default function ProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: p, currentLoaded, repos } = useSelector((s) => s.profile);
  const me = useSelector((s) => s.auth.user);

  useEffect(() => { dispatch(fetchProfile(id)); }, [dispatch, id]);
  useEffect(() => { if (p?.githubUsername) dispatch(fetchRepos(p.githubUsername)); }, [dispatch, p]);

  if (!currentLoaded) return <p className="muted">Loading…</p>;
  if (!p) return <p>This developer has no profile. <Link to="/profiles">Back to developers</Link></p>;
  return (
    <>
      <div className="card person big">
        <img src={p.user.avatar} alt="" width="120" height="120" />
        <div>
          <h1>{p.user.name}</h1>
          <p className="lead">{[p.status, p.company && `at ${p.company}`].filter(Boolean).join(' ')}</p>
          {p.location && <p className="muted">{p.location}</p>}
          <p className="row wrap">
            {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer">Website</a>}
            {p.githubUsername && <a href={`https://github.com/${p.githubUsername}`} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {me?.id === p.user._id && <Link to="/edit-profile">Edit profile</Link>}
          </p>
        </div>
      </div>
      {p.bio && <section><h2>About</h2><p>{p.bio}</p></section>}
      <section><h2>Skills</h2><p className="tags">{p.skills.map((s) => <span key={s}>{s}</span>)}</p></section>
      {p.experience.length > 0 && (
        <section>
          <h2>Experience</h2>
          <ul className="list">{p.experience.map((e) => (
            <li key={e._id} className="card"><strong>{e.title}</strong>, {e.company}<div className="muted">{period(e)}</div>{e.description && <p>{e.description}</p>}</li>
          ))}</ul>
        </section>
      )}
      {p.education.length > 0 && (
        <section>
          <h2>Education</h2>
          <ul className="list">{p.education.map((e) => (
            <li key={e._id} className="card"><strong>{e.school}</strong><div>{[e.degree, e.fieldOfStudy].filter(Boolean).join(', ')}</div><div className="muted">{period(e)}</div></li>
          ))}</ul>
        </section>
      )}
      {repos.length > 0 && (
        <section>
          <h2>Latest repositories</h2>
          <ul className="list">{repos.map((r) => (
            <li key={r.id} className="card">
              <a href={r.url} target="_blank" rel="noopener noreferrer"><strong>{r.name}</strong></a>
              {r.description && <p className="muted">{r.description}</p>}
              <span className="muted">{r.stars} stars · {r.forks} forks</span>
            </li>
          ))}</ul>
        </section>
      )}
    </>
  );
}
