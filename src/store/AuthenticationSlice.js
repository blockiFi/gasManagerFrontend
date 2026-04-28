import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  user  : {},
  token : '', 
  business : {}, 
  authenticated : false
};

// Create a slice
const AuthenicationSlice = createSlice({
  name: 'authenticaton',
  initialState,
  reducers: {
    setUser: (state , action) => {
      state.user =  action.payload;
    },
    setToken: (state , action) => {
      state.token = action.payload;
      state.authenticated = true;
    },
    setUserBusiness : (state , action) =>{
        state.business = action.payload;
    }
  },
});

// Export actions
export const { setUser, setToken , setUserBusiness } = AuthenicationSlice.actions;

// Export the reducer to use in the store
export default AuthenicationSlice.reducer;