import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useStore } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

import { apiSlice } from "./api/api_slice";
import board_reducer from "./slices/board_slice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    board: board_reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Добавляем сериализационную проверку для thunk'ов
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.MODE !== "production",
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Правильные типизированные хуки
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<RootState>();
