import { createSlice } from '@reduxjs/toolkit';
import api from '../api';
import { thunk } from './thunk';

export const register = thunk('auth/register', (form) => api.post('/auth/register', form).then((r) => r.data));
export const login = thunk('auth/login', (form) => api.post('/auth/login', form).then((r) => r.data));
export const loadUser = thunk('auth/loadUser', () => api.get('/auth/me').then((r) => r.data), { quiet: true });

const initialToken = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: initialToken, user: null, initialized: !initialToken },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    const signedIn = (state, { payload }) => {
      localStorage.setItem('token', payload.token);
      state.token = payload.token;
      state.user = payload.user;
      state.initialized = true;
    };
    builder
      .addCase(register.fulfilled, signedIn)
      .addCase(login.fulfilled, signedIn)
      .addCase(loadUser.fulfilled, (state, { payload }) => { state.user = payload.user; state.initialized = true; })
      .addCase(loadUser.rejected, (state) => { state.initialized = true; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
