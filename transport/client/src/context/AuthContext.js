import { createContext } from "react";

export const AuthContext = createContext({
    userId: null,
    userRole: null,
    login: () => {},
    logout: () => {}
});