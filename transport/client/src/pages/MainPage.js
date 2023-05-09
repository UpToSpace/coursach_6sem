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
        <div style={{"backgroundImage": `url(${back})`,
        "top": "0",
        "height": "100%",
        "backgroundSize": "cover",
        "backgroundPosition": "center"}}>
            <h1>Дзень добры!</h1>
            {/* <img src={bus} alt="bus" /> */}
        </div>
    )
}