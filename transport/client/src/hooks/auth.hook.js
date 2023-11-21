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
        setUserId(user._id)
        setUserRole(user.role);
        localStorage.setItem('token', jwtToken);
    }, []);

    const logout = useCallback(async () => {
        const data = await request('/api/auth/logout', 'POST', null);
        setToken(null);
        setUserId(null);
        setUserRole(null)
        localStorage.removeItem('token');     
    }, []);

    const getUserRole = useCallback(async (token) => {
        try {
            const data = await request('/api/auth/userrole');
            //console.log('auth.hook.js: getUserRole: data.role = ', data.role)
            setUserId(data.id);
            setUserRole(data.role); 
        } catch (e) {
            console.log('auth.hook.js: getUserRole: e.message = ', e.message)
            setUserRole(null)
        }
    }, [userRole, userId]);

    useEffect(() => {
        const data = localStorage.getItem('token');
        if (data) {
            getUserRole();
        } else {
            setUserRole(null)
        }
        setReady(true)
    }, [getUserRole]);

    return { login, logout, ready, userRole, userId };
}