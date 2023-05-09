import React from 'react';
import { useHttp } from '../hooks/http.hook';
import { Loader } from '../components/Loader';
import bus from '../styles/images/statuscodes/404.png'

export const NotFoundPage = () => {
    const { loading } = useHttp();

    if(loading) {
        return <Loader />
    }

    return (
        <div className='container code404'>
            <h1>Упс! Вашага маршрута няма. <a href="/">На галоўную</a></h1>
            <img src={bus} alt="bus" />
        </div>
    )
}