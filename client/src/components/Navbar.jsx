import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';

export default function Navbar() {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="nav">
      <Link to="/" className="brand">DevConnector</Link>
      <nav aria-label="Main">
        <NavLink to="/profiles">Developers</NavLink>
        {token ? (
          <>
            <NavLink to="/posts">Posts</NavLink>
            <NavLink to="/dashboard">{user ? user.name.split(' ')[0] : 'Dashboard'}</NavLink>
            <button type="button" className="link-btn" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <>
            <NavLink to="/register">Register</NavLink>
            <NavLink to="/login">Sign in</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
