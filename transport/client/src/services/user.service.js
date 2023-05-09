import { useHttp } from "../hooks/http.hook";

export const UserService = () => {
    const {request} = useHttp()
    const login = async (email, passoword) => {
        const data = await request('/api/auth/login', 'POST', { email, passoword });
        return data;
    }

    const logout = async () => {
        const data = await request('/api/auth/logout', 'POST', null);
    }
    return { login, logout }
}
