import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./features/auth/auth-slice"
import ticketsReducer from "./features/tickets/tickets-slice"
import usersReducer from "./features/users/users-slice"
import categoriesReducer from "./features/categories/categories-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    users: usersReducer,
    categories: categoriesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
