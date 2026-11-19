import { configureStore } from '@reduxjs/toolkit';
import auth from './features/authSlice';
import profile from './features/profileSlice';
import posts from './features/postsSlice';
import ui from './features/uiSlice';

export default configureStore({ reducer: { auth, profile, posts, ui } });
