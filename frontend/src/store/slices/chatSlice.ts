import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message, ChatCompletionUsage } from "@/types";

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  selectedModel: string;
  activeConversationId: string | null;
  lastUsage: ChatCompletionUsage | null;
}

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  streamingContent: "",
  selectedModel: "gemini-2.5-flash",
  activeConversationId: null,
  lastUsage: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    setStreaming(state, action: PayloadAction<boolean>) {
      state.isStreaming = action.payload;
      if (action.payload) state.streamingContent = "";
    },
    appendStreamContent(state, action: PayloadAction<string>) {
      state.streamingContent += action.payload;
    },
    finalizeStream(state, action: PayloadAction<ChatCompletionUsage | undefined>) {
      if (state.streamingContent) {
        state.messages.push({ role: "assistant", content: state.streamingContent });
      }
      state.isStreaming = false;
      state.streamingContent = "";
      state.lastUsage = action.payload || null;
    },
    setSelectedModel(state, action: PayloadAction<string>) {
      state.selectedModel = action.payload;
    },
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    resetChat(state) {
      state.messages = [];
      state.isStreaming = false;
      state.streamingContent = "";
      state.activeConversationId = null;
      state.lastUsage = null;
    },
  },
});

export const {
  setMessages, addMessage, setStreaming, appendStreamContent,
  finalizeStream, setSelectedModel, setActiveConversationId, resetChat,
} = chatSlice.actions;
export default chatSlice.reducer;
