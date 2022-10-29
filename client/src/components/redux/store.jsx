import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userSlice"
import warnReducer from "./reducers/WarnSlice";

export const store = configureStore({
    reducer : {
        userData : userReducer,
        warn : warnReducer,
    }
    
});

