import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

interface UiState {
  globalLoading: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  globalLoading: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>) => {
      const id = Date.now().toString();
      state.toasts.push({
        id,
        message: action.payload.message,
        type: action.payload.type,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { setGlobalLoading, showToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
