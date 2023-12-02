import React from 'react';
import { useHttp } from '../../hooks/http.hook';
import { Loader } from '../../components/Loader';
import bus from '../../styles/images/statuscodes/404.png'

export const SomethingWrongPage = () => {
    const { loading } = useHttp();

    if (loading) {
        return <Loader />
    }

    return (
        <div className='container code404'>
            <h1>Упс! Штосцi пайшло ня так. <a href="/">На галоўную</a></h1>
            <img src={bus} alt="bus" />
        </div>
    )
}