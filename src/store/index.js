import { configureStore } from '@reduxjs/toolkit';
import AuthenticationReducer from './AuthenticationSlice.js';
import MenuReducer from './MenuSlice.js';

// Configure the store
const store = configureStore({
  reducer: {
    authentication: AuthenticationReducer,
    menu : MenuReducer
  },
});

export default store;