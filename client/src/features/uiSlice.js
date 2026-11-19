import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toast: null },
  reducers: {
    notify: (state, { payload }) => { state.toast = { id: Date.now(), ...payload }; },
    clearToast: (state) => { state.toast = null; },
  },
});

export const { notify, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
