import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';
import moment from 'moment';
import 'moment/locale/be';

export const TicketPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [ticket, setTicket] = useState();
    const { id } = useParams();

    const getTicket = useCallback(async () => {
        const data = await request('/api/tickets/' + id, 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        setTicket(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getTicket();
    }, [getTicket])

    if(loading) {
        return <Loader />
    }

    return (
        ticket && <div className='container'>
            <div class="row">
                <div class="col s12 m6">
                    <div class="card blue-grey darken-1">
                        <div class="card-content white-text">
                            <span class="card-title">Проездной</span>
                            <p>Тып білета: {ticket.ticketType.type}</p>
                            <p>Транспарт: {ticket.ticketType.transport}</p>
                            {ticket.ticketType.tripCount !== -1 && <p>Колькасць паездак: {ticket.ticketType.tripCount}</p>}
                            <p>Колькасць сутак: {ticket.ticketType.duration}</p>
                            <p>Цана: {ticket.ticketType.price}</p>
                            <p>Дата пачатку: {moment(ticket.dateBegin).format('LLLL')}</p>
                            <p>Дата заканчэння: {moment(ticket.dateEnd).format('LLLL')}</p>
                        </div>
                        <div class="card-action">
                            <a href="/tickets">Назад</a>
                            <a href="/">На галоўную</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}