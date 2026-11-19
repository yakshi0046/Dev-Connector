import { createSlice } from '@reduxjs/toolkit';
import api from '../api';
import { thunk, orNull } from './thunk';
import { notify } from './uiSlice';

export const fetchMe = thunk('profile/fetchMe', () => orNull(api.get('/profile/me')).then((r) => (r ? r.data : null)), { quiet: true });
export const fetchProfiles = thunk('profile/fetchAll', () => api.get('/profile').then((r) => r.data));
export const fetchProfile = thunk('profile/fetchOne', (userId) => orNull(api.get(`/profile/user/${userId}`)).then((r) => (r ? r.data : null)), { quiet: true });
export const fetchRepos = thunk('profile/fetchRepos', (username) => api.get(`/profile/github/${username}`).then((r) => r.data), { quiet: true });
export const saveProfile = thunk('profile/save', async (form, dispatch) => {
  const { data } = await api.post('/profile', form);
  dispatch(notify({ kind: 'success', message: 'Profile saved' }));
  return data;
});
export const addEntry = thunk('profile/addEntry', async ({ kind, form }, dispatch) => {
  const { data } = await api.put(`/profile/${kind}`, form);
  dispatch(notify({ kind: 'success', message: 'Saved' }));
  return data;
});
export const deleteEntry = thunk('profile/deleteEntry', ({ kind, id }) => api.delete(`/profile/${kind}/${id}`).then((r) => r.data));
export const deleteAccount = thunk('profile/deleteAccount', () => api.delete('/profile').then((r) => r.data));

const profileSlice = createSlice({
  name: 'profile',
  initialState: { me: null, meLoaded: false, list: [], listLoaded: false, current: null, currentLoaded: false, repos: [] },
  reducers: {},
  extraReducers: (builder) => {
    const setMe = (state, { payload }) => { state.me = payload; state.meLoaded = true; };
    builder
      .addCase(fetchMe.fulfilled, setMe)
      .addCase(fetchMe.rejected, (state) => { state.meLoaded = true; })
      .addCase(saveProfile.fulfilled, setMe)
      .addCase(addEntry.fulfilled, setMe)
      .addCase(deleteEntry.fulfilled, setMe)
      .addCase(fetchProfiles.fulfilled, (state, { payload }) => { state.list = payload; state.listLoaded = true; })
      .addCase(fetchProfile.pending, (state) => { state.current = null; state.currentLoaded = false; state.repos = []; })
      .addCase(fetchProfile.fulfilled, (state, { payload }) => { state.current = payload; state.currentLoaded = true; })
      .addCase(fetchProfile.rejected, (state) => { state.currentLoaded = true; })
      .addCase(fetchRepos.fulfilled, (state, { payload }) => { state.repos = payload; })
      .addCase(deleteAccount.fulfilled, (state) => { state.me = null; });
  },
});

export default profileSlice.reducer;
