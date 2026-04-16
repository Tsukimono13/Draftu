import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface DragItem {
  date: string;
  itemId: string;
}

const dragSlice = createSlice({
  name: "drag",
  initialState: { item: null as DragItem | null },
  reducers: {
    startDrag(state, action: PayloadAction<DragItem>) {
      state.item = action.payload;
    },
    endDrag(state) {
      state.item = null;
    },
  },
});

export const dragActions = dragSlice.actions;
export { dragSlice };
