import React from 'react';
import { useHttp } from '../hooks/http.hook';
import { Loader } from '../components/Loader';
import back from '../styles/images/back.jpg'

export const MainPage = () => {
    const { loading } = useHttp();

    if(loading) {
        return <Loader />
    }

    return (
        <div>
            <h1>Дзень добры!</h1>
        </div>
    )
}