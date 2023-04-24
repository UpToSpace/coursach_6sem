import React from 'react';
import { useHttp } from '../hooks/http.hook';
import { Loader } from '../components/Loader';

export const NotFoundPage = () => {
    const { loading } = useHttp();

    if(loading) {
        return <Loader />
    }

    return (
        <div>
            NOT FOUND
        </div>
    )
}