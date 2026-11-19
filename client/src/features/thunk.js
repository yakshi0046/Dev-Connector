import { createAsyncThunk } from '@reduxjs/toolkit';
import { errorMessage } from '../api';
import { notify } from './uiSlice';

// Wraps an async function as a thunk that reports failures as toasts unless quiet is set.
export const thunk = (name, fn, { quiet = false } = {}) =>
  createAsyncThunk(name, async (arg, { dispatch, rejectWithValue }) => {
    try {
      return await fn(arg, dispatch);
    } catch (err) {
      const message = errorMessage(err);
      if (!quiet) dispatch(notify({ kind: 'error', message }));
      return rejectWithValue(message);
    }
  });

export const orNull = (promise) =>
  promise.catch((err) => {
    if (err.response?.status === 404) return null;
    throw err;
  });
