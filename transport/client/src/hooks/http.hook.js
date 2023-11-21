import { useState, useCallback, useEffect } from 'react'

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
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

            //console.log(data);

            if (!response.ok) {
                if (response.status === 401 && data.message === 'jwt expired') {
                    const dataRefresh = await request('/api/auth/refresh', 'POST', null);
                    localStorage.setItem('token', dataRefresh.token);
                    headers['Authorization'] = `Bearer ${dataRefresh.token}`;
                    const newResponse = await fetch(url, {
                        method,
                        body,
                        headers
                    });
                    const newData = await newResponse.json();
                    setLoading(false)
                    return newData;
                }
                if (response.status === 401 && data.message === 'refresh jwt expired') {
                    await request('/api/auth/logout', 'POST', null);
                    localStorage.removeItem('token');
                    window.location.reload();
                    return;
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