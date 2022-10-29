import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    userData : [],
}

const userSlice = createSlice ({
    name : "userData",
    initialState,
    reducers :{
        addUserData : (state, {payload}) => {
            state.userData = payload;
        }
    }
})

export const { addUserData } = userSlice.actions;
export const getUserData = (state) => state.userData.userData;
export default userSlice.reducer;