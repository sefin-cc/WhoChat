import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';

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
      // Check if the message is indicating the partner's disconnection
      if (action.payload.message === `${state.partnerId}-Disconnected`) {
        state.partnerId = null; // Set partnerId to null when the partner disconnects
        
        Toast.show({
          type: 'info',
          position: 'top', 
          text1: 'Your partner left the chat!',
          visibilityTime: 6000, 
          autoHide: true,
          topOffset: 100,
        });
        
      }
      
    },
    clearChat: (state) => {
      state.messages = [];
    },
  },
});

export const { setUserIds, addMessage, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
