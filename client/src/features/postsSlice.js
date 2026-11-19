import { createSlice } from '@reduxjs/toolkit';
import api from '../api';
import { thunk, orNull } from './thunk';

export const fetchPosts = thunk('posts/fetchAll', () => api.get('/posts').then((r) => r.data));
export const fetchPost = thunk('posts/fetchOne', (id) => orNull(api.get(`/posts/${id}`)).then((r) => (r ? r.data : null)), { quiet: true });
export const addPost = thunk('posts/add', (text) => api.post('/posts', { text }).then((r) => r.data));
export const deletePost = thunk('posts/delete', (id) => api.delete(`/posts/${id}`).then(() => id));
export const likePost = thunk('posts/like', (id) => api.put(`/posts/like/${id}`).then((r) => r.data));
export const unlikePost = thunk('posts/unlike', (id) => api.put(`/posts/unlike/${id}`).then((r) => r.data));
export const addComment = thunk('posts/addComment', ({ id, text }) => api.post(`/posts/comment/${id}`, { text }).then((r) => r.data));
export const deleteComment = thunk('posts/deleteComment', ({ id, commentId }) => api.delete(`/posts/comment/${id}/${commentId}`).then((r) => r.data));

const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [], loaded: false, current: null, currentLoaded: false },
  reducers: {},
  extraReducers: (builder) => {
    const patch = (field) => (state, { meta, payload }) => {
      const id = typeof meta.arg === 'string' ? meta.arg : meta.arg.id;
      const post = state.items.find((p) => p._id === id);
      if (post) post[field] = payload;
      if (state.current?._id === id) state.current[field] = payload;
    };
    builder
      .addCase(fetchPosts.fulfilled, (state, { payload }) => { state.items = payload; state.loaded = true; })
      .addCase(fetchPost.pending, (state) => { state.current = null; state.currentLoaded = false; })
      .addCase(fetchPost.fulfilled, (state, { payload }) => { state.current = payload; state.currentLoaded = true; })
      .addCase(fetchPost.rejected, (state) => { state.currentLoaded = true; })
      .addCase(addPost.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
      .addCase(deletePost.fulfilled, (state, { payload }) => { state.items = state.items.filter((p) => p._id !== payload); })
      .addCase(likePost.fulfilled, patch('likes'))
      .addCase(unlikePost.fulfilled, patch('likes'))
      .addCase(addComment.fulfilled, patch('comments'))
      .addCase(deleteComment.fulfilled, patch('comments'));
  },
});

export default postsSlice.reducer;
