import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
});

export const wishlistReducer = wishlistSlice.reducer;
