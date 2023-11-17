import { ServerType } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModalType = "createServer" | "invite";

type ModalData = {
  server?: ServerType;
};

type ModalStore = {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
};

const initialState: ModalStore = {
  type: null,
  data: {},
  isOpen: false,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    onOpen: (
      state,
      action: PayloadAction<Pick<ModalStore, "data" | "type">>
    ) => {
      state.type = action.payload.type;
      state.data = action.payload.data;
      state.isOpen = true;
    },
    onClose: (state) => {
      state.type = null;
      state.isOpen = false;
    },
  },
});

export const { onOpen, onClose } = modalSlice.actions;
export default modalSlice.reducer;
