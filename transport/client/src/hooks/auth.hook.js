import { useState, useCallback, useEffect } from "react";
import { useHttp } from "./http.hook";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [ready, setReady] = useState(false);
    const [userRole, setUserRole] = useState(undefined);
    const { request } = useHttp();

    const login = useCallback((jwtToken, user) => {
        setToken(jwtToken);
        setUserId(user.id);
        setUserRole(user.role);
        localStorage.setItem('userData', JSON.stringify({
            userId: user.id, token: jwtToken
        }));
    }, []);

    const logout = useCallback(async () => {
        const data = await request('/api/auth/logout', 'POST', null);
        setToken(null);
        setUserId(null);
        setUserRole(null)
        localStorage.removeItem('userData');     
    }, []);

    const getUserRole = useCallback(async (token) => {
        try {
            const data = await request('/api/auth/userrole', 'GET', null);
            console.log('auth.hook.js: getUserRole: data.role = ', data.role)
            setUserRole(data.role);
        } catch (e) {
            console.log('auth.hook.js: getUserRole: e.message = ', e.message)
        }
    }, [userRole]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('userData'));
        if (data && data.token) {
            getUserRole(data.token);
            setUserId(data.userId)
        } else {
            setUserRole(null)
        }
        setReady(true)
    }, [getUserRole]);

    return { login, logout, token, userId, ready, userRole };
}