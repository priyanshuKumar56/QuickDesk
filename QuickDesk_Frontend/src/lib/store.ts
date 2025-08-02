import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./features/auth/authSlice"
import ticketSlice from "./features/tickets/ticketSlice"
import userSlice from "./features/users/userSlice"
import roleRequestSlice from "./features/roleRequests/roleRequestSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tickets: ticketSlice,
    users: userSlice,
    roleRequests: roleRequestSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
