import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    warn : {
        warn : "nothing",
        username : "no one"
    }
}

const warnSlice = createSlice ({
    name : "warn",
    initialState,
    reducers :{
        addWarn : (state, {payload}) => {
            state.warn = payload;
        }
    }
})

export const { addWarn } = warnSlice.actions;
export const getWarn = (state) => state.warn.warn;
export default warnSlice.reducer;