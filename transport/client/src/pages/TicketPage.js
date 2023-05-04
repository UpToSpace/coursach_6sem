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
        ticket && <div>
            <div class="row">
                <div class="col s12 m6">
                    <div class="card blue-grey darken-1">
                        <div class="card-content white-text">
                            <span class="card-title">Проездной</span>
                            <p>Тип билета: {ticket.ticketType.type}</p>
                            <p>Транспорт: {ticket.ticketType.transport}</p>
                            {ticket.ticketType.tripCount !== -1 && <p>Количество поездок: {ticket.ticketType.tripCount}</p>}
                            <p>Количество суток: {ticket.ticketType.duration}</p>
                            <p>Стоимость: {ticket.ticketType.price}</p>
                            <p>Дата начала: {moment(ticket.dateBegin).format('LLLL')}</p>
                            <p>Дата окончания: {moment(ticket.dateEnd).format('LLLL')}</p>
                        </div>
                        <div class="card-action">
                            <a href="/tickets">Назад</a>
                            <a href="/">На главную</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}