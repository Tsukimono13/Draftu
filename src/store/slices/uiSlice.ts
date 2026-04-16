import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { toastMessage: "" },
  reducers: {
    showToast(state, action: PayloadAction<string>) {
      state.toastMessage = action.payload;
    },
    clearToast(state) {
      state.toastMessage = "";
    },
  },
});

export const uiActions = uiSlice.actions;
export { uiSlice };
