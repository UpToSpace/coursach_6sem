import { useState, useCallback, useEffect } from 'react'

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setLoading(true);
        try {
            if (localStorage.getItem('userData') !== null) {
                const token = JSON.parse(localStorage.getItem('userData')).token;

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            if (body) {
                body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(url, {
                method,
                body,
                headers
            });
            const data = await response.json();

            if (!response.ok) {
                console.log("http hook res status: " + response.status)
                if (response.status === 401 && data.message === 'jwt expired') {
                    const dataRefresh = await request('/api/auth/refresh', 'POST', null);
                    localStorage.setItem('userData', JSON.stringify({
                        userId: dataRefresh.user.id, token: dataRefresh.token
                    }));
                    setLoading(false)
                    return dataRefresh;
                }
                throw new Error(data.message || 'Something went wrong');
            }

            setLoading(false)

            return data;
        } catch (e) {
            setLoading(false);
            setError(e.message);
            throw e;
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { loading, request, error, clearError };
}