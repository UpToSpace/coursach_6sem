import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';

export const TicketPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [ticket, setTicket] = useState();
    const { id } = useParams();

    const getTicket = useCallback(async () => {
        const data = await request('/api/ticket/' + id, 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        setTicket(data);
        console.log(data);
    }, [auth.token, request, id])

    useEffect(() => {
        getTicket();
    }, [getTicket])

    if(loading) {
        return <Loader />
    }

    return (
        <div>
            <div class="row">
                <div class="col s12 m6">
                    <div class="card blue-grey darken-1">
                        <div class="card-content white-text">
                            <span class="card-title">Card Title</span>
                            <p>I am a very simple card. I am good at containing small bits of information.
                                I am convenient because I require little markup to use effectively.</p>
                        </div>
                        <div class="card-action">
                            <a href="#">This is a link</a>
                            <a href="#">This is a link</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}