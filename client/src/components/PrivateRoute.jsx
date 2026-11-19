import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const { token, initialized } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!initialized) return <p className="muted">Loading…</p>;
  return <Outlet />;
}
