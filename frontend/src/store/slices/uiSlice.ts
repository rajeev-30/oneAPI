import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarCollapsed: boolean;
  isMobile: boolean;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  isMobile: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setMobile(state, action: PayloadAction<boolean>) {
      state.isMobile = action.payload;
      if (action.payload) state.sidebarCollapsed = true;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setMobile } = uiSlice.actions;
export default uiSlice.reducer;
