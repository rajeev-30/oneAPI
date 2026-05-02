"use client";

import { configureStore, combineReducers, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import type { User } from "@/types";

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null as User | null, isAuthenticated: false, isLoading: true },
  reducers: {
    setUser(state, action: PayloadAction<User | null>) { state.user = action.payload; state.isAuthenticated = !!action.payload; state.isLoading = false; },
    clearAuth(state) { state.user = null; state.isAuthenticated = false; state.isLoading = false; },
    setLoading(state, action: PayloadAction<boolean>) { state.isLoading = action.payload; },
  },
});

// UI slice
const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarCollapsed: false },
  reducers: {
    toggleSidebar(state) { state.sidebarCollapsed = !state.sidebarCollapsed; },
  },
});

export const { setUser, clearAuth, setLoading } = authSlice.actions;
export const { toggleSidebar } = uiSlice.actions;

const rootReducer = combineReducers({ auth: authSlice.reducer, ui: uiSlice.reducer });
const persistedReducer = persistReducer({ key: "oneapi-admin", version: 1, storage, whitelist: ["auth"] }, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) => gDM({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
