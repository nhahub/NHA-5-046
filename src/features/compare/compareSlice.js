import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {},
});

export const compareReducer = compareSlice.reducer;
