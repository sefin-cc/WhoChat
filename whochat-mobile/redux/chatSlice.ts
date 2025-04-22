import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  from: string;
  to: string | null;
  message: string;
}

interface ChatState {
  userId: string | null;
  partnerId: string | null;
  messages: Message[];
}

const initialState: ChatState = {
  userId: null,
  partnerId: null,
  messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUserIds: (state, action: PayloadAction<{ userId: string|null; partnerId?: string|null }>) => {
      state.userId = action.payload.userId;
      state.partnerId = action.payload.partnerId ?? null;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearChat: (state) => {
      state.userId = null;
      state.partnerId = null;
      state.messages = [];
    },
  },
});

export const { setUserIds, addMessage, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
