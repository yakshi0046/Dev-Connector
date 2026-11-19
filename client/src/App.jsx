import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import { loadUser, logout } from './features/authSlice';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import Landing from './components/Landing';
import Navbar from './components/Navbar';
import PostPage from './components/PostPage';
import Posts from './components/Posts';
import PrivateRoute from './components/PrivateRoute';
import ProfileForm from './components/ProfileForm';
import ProfilePage from './components/ProfilePage';
import Profiles from './components/Profiles';
import Toast from './components/Toast';

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  useEffect(() => { if (token) dispatch(loadUser()); }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onExpired = () => dispatch(logout());
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthForm mode="login" />} />
          <Route path="/register" element={<AuthForm mode="register" />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/edit-profile" element={<ProfileForm />} />
            <Route path="/add-experience" element={<EntryForm kind="experience" />} />
            <Route path="/add-education" element={<EntryForm kind="education" />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toast />
    </>
  );
}
