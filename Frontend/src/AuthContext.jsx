import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("agentgpt_user");
        return stored ? JSON.parse(stored) : null;
    });

    const login = (userData, token) => {
        localStorage.setItem("agentgpt_token", token);
        localStorage.setItem("agentgpt_user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("agentgpt_token");
        localStorage.removeItem("agentgpt_user");
        setUser(null);
    };

    const getToken = () => localStorage.getItem("agentgpt_token");

    return (
        <AuthContext.Provider value={{ user, login, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
