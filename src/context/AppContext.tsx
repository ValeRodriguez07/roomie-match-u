import React, { createContext, useContext, useReducer, useEffect } from "react";
import type {
    User,
    Notification,
} from "../types";
import { userService } from "../services/UserService";
import { notificationService } from "../services/NotificationService";
import { translations } from '../i18n';

interface AppState {
  user: User | null;
  notifications: Notification[];
  unreadNotifications: number;
  loading: boolean;
  error: string | null;
  language: "en" | "es";
  country: string;
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "SET_LANGUAGE"; payload: "en" | "es" }
  | { type: "SET_COUNTRY"; payload: string }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_NOTIFICATION_READ"; payload: string };

const initialState: AppState = {
  user: null,
  notifications: [],
  unreadNotifications: 0,
  loading: false,
  error: null,
  language: "es",
  country: "ES",
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_USER":
      return { ...state, user: action.payload, error: null };
    case "SET_NOTIFICATIONS":
      const notifications = action.payload;
      const unreadNotifications = notifications.filter((n) => !n.read).length;
      return { ...state, notifications, unreadNotifications };
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    case "SET_COUNTRY":
      return { ...state, country: action.payload };
    case "ADD_NOTIFICATION":
      const newNotifications = [action.payload, ...state.notifications];
      const newUnread =
        state.unreadNotifications + (action.payload.read ? 0 : 1);
      return {
        ...state,
        notifications: newNotifications,
        unreadNotifications: newUnread,
      };
    case "MARK_NOTIFICATION_READ":
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
      const updatedUnread = updatedNotifications.filter((n) => !n.read).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadNotifications: updatedUnread,
      };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  setLanguage: (language: "en" | "es") => void;
  setCountry: (country: string) => void;
  t: (key: keyof typeof translations['en']) => string; // Nueva función de traducción
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Función de traducción
  const t = (key: keyof typeof translations['en']): string => {
    return translations[state.language][key] || key;
  };

  useEffect(() => {
    // Cargar notificaciones cuando el usuario cambie
    if (state.user) {
      loadNotifications();
    }
  }, [state.user]);

  const login = async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const user = await userService.login(email, password);
      if (user) {
        dispatch({ type: "SET_USER", payload: user });
      } else {
        dispatch({ type: "SET_ERROR", payload: "Credenciales inválidas" });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al iniciar sesión" });
    }
  };

  const logout = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await userService.logout();
      dispatch({ type: "SET_USER", payload: null });
      dispatch({ type: "SET_NOTIFICATIONS", payload: [] });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al cerrar sesión" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const user = await userService.register(userData);
      dispatch({ type: "SET_USER", payload: user });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Error al registrar usuario" });
    }
  };

  const loadNotifications = async () => {
    if (!state.user) return;

    try {
      const notifications = await notificationService.getUserNotifications(
        state.user.id
      );
      dispatch({ type: "SET_NOTIFICATIONS", payload: notifications });
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      dispatch({ type: "MARK_NOTIFICATION_READ", payload: notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!state.user) return;

    try {
      await notificationService.markAllAsRead(state.user.id);
      const notifications = await notificationService.getUserNotifications(
        state.user.id
      );
      dispatch({ type: "SET_NOTIFICATIONS", payload: notifications });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const setLanguage = (language: "en" | "es") => {
    dispatch({ type: "SET_LANGUAGE", payload: language });
  };

  const setCountry = (country: string) => {
    dispatch({ type: "SET_COUNTRY", payload: country });
  };

  const value: AppContextType = {
    ...state,
    login,
    logout,
    register,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setLanguage,
    setCountry,
    t // Añadimos la función de traducción
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
