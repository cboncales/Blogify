import { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.getProfile();
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: localStorage.getItem("token"),
        },
      });
    } catch (error) {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authAPI.login({ email, password });

      localStorage.setItem("token", response.data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: "LOGIN_ERROR", payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authAPI.register(userData);

      localStorage.setItem("token", response.data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: response.data.user,
          token: response.data.token,
        },
      });

      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({ type: "LOGIN_ERROR", payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
