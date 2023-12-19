import { ChannelType, ServerType } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ModalType =
  | "createServer"
  | "invite"
  | "editServer"
  | "manageMembers"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage";

export type ModalData = {
  server?: ServerType;
  channelType?: "TEXT" | "AUDIO" | "VIDEO";
  channel?: ChannelType;
  apiUrl?: string;
  query?: Record<string, string>;
  type?: string;
};

type ModalStore = {
  type: ModalType | null;
  data?: ModalData;
  isOpen?: boolean;
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
    onOpen: (state, action: PayloadAction<ModalStore>) => {
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
