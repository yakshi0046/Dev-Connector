import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';

export default function Landing() {
  const token = useSelector((s) => s.auth.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return (
    <section className="hero">
      <h1>Show your work. Find your people.</h1>
      <p>Create a developer profile, share what you are building and talk to other engineers.</p>
      <div className="row">
        <Link className="btn primary" to="/register">Create a profile</Link>
        <Link className="btn" to="/profiles">Browse developers</Link>
      </div>
    </section>
  );
}
