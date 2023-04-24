import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { AddTicketTypeForm } from '../../components/AddTicketTypeForm';
import { options } from '../../components/arrays';
import M from 'materialize-css';

export const AdminTicketTypesPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [ticketTypes, setTicketTypes] = useState();
    const [newTicketType, setNewTicketType] = useState();

    const getTicketTypes = useCallback(async () => {
        const data = await request('/api/tickets/types', 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        setTicketTypes(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getTicketTypes();
        setNewTicketType({
            type: options.type[0],
            transport: [],
            tripCount: null,
            duration: null,
            price: null
        })
        M.updateTextFields();
        M.FormSelect.init(document.querySelectorAll('select'), null);
    }, [getTicketTypes])

    if (loading) {
        return <Loader />
    }

    const AddTicketTypeHandler = async (e) => {
        e.preventDefault();
        // console.log('click');
        const tripCount = newTicketType.type === options.type[0] ? newTicketType.tripCount : -1;
        if (!(new RegExp(/^\d+\.?\d*$/).test(newTicketType.price))) {
            window.alert('Введите корректную цену');
            return;
        }
        if (newTicketType.transport.length === 0 || !newTicketType.duration || !newTicketType.price ||
            !tripCount) {
            window.alert('Заполните все поля');
            return;
        }
        if (+newTicketType.duration <= 0 || +newTicketType.price <= 0 ||
            newTicketType.type === options.type[0] && +newTicketType.tripCount <= 0) {
            window.alert('Введите корректные данные');
            return;
        }
        try {
            let ticketType;
            if (newTicketType.type === options.type[0]) { // Если тип проездного на определенное количество поездок
                ticketType = ticketTypes.find(ticketType => ticketType.type === newTicketType.type && ticketType.transport === newTicketType.transport.sort().join('-') &&
                    ticketType.tripCount === +tripCount);
            } else {
                ticketType = ticketTypes.find(ticketType => ticketType.type === newTicketType.type && ticketType.transport === newTicketType.transport.sort().join('-') &&
                    ticketType.duration === +newTicketType.duration);
            }
            if (ticketType) {
                window.alert('Такой тип проездного уже существует');
                return;
            }
            let data;
            if (newTicketType.type === options.type[0]) { // Если тип проездного на определенное количество поездок
            data = await request('/api/tickets/types', 'POST', { ...newTicketType, transport: newTicketType.transport.sort().join('-') }, {
                Authorization: `Bearer ${auth.token}`
            });
        } else {
            data = await request('/api/tickets/types', 'POST', { ...newTicketType, transport: newTicketType.transport.sort().join('-'), tripCount: -1 }, {
                Authorization: `Bearer ${auth.token}`
            });
        }
            // console.log({ ...newTicketType, transport: newTicketType.transport.sort().join('-'), tripCount: tripCount });
            console.log(data);
            setNewTicketType({
                type: options.type[0],
                transport: [],
                tripCount: null,
                duration: null,
                price: null
            })
            getTicketTypes();
        } catch (e) { }
    }


    const DeleteTicketTypeHandler = async (id) => {
        console.log(id);
        if (window.confirm('Удалить тип проездного?')) {
            try {
                const data = await request(`/api/tickets/types/${id}`, 'DELETE', null, {
                    Authorization: `Bearer ${auth.token}`
                });
                console.log(data);
                getTicketTypes();
            } catch (e) { }
        }
    }

    return (
        <div>
            {ticketTypes && AddTicketTypeForm({readOnly: false, onClickHandler: AddTicketTypeHandler, options, setNewTicketType, newTicketType, btnText: 'Добавить'})}
            {ticketTypes &&
                ticketTypes.map(ticketType =>
                    <div className="row" key={ticketType._id}>
                        <div className="col s6 m5">
                            <div className="card blue-grey darken-1">
                                <div className="card-content white-text">
                                    <p>Тип билета: {ticketType.type}</p>
                                    <p>Транспорт: {ticketType.transport}</p>
                                    {ticketType.tripCount !== -1 && <p>Количество поездок: {ticketType.tripCount}</p>}
                                    <p>Количество суток: {ticketType.duration}</p>
                                    <p>Стоимость: {ticketType.price}</p>
                                </div>
                                <div className="card-action">
                                    <a href={'/admin/tickets/' + ticketType._id}>Изменить стоимость</a>
                                    <button onClick={(e) => DeleteTicketTypeHandler(ticketType._id)} className="waves-effect waves-light btn-small">Удалить</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}