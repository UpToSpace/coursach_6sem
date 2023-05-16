import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { AddTicketTypeForm } from '../../components/AddTicketTypeForm';
import { options } from '../../components/arrays';
import M from 'materialize-css';
import { useMessage } from '../../hooks/message.hook';

export const AdminTicketTypesPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [ticketTypes, setTicketTypes] = useState();
    const [newTicketType, setNewTicketType] = useState();
    const message = useMessage()

    const getTicketTypes = useCallback(async () => {
        const data = await request('/api/tickets/types');
        const sortedData = data.sort(e => e.type)
        setTicketTypes(sortedData);
        //console.log(data);
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
            message('Увядзіце карэктную цану');
            return;
        }
        if (newTicketType.transport.length === 0 || !newTicketType.duration || !newTicketType.price ||
            !tripCount) {
            message('Запоўніце ўсе палі');
            return;
        }
        if (+newTicketType.duration <= 0 || +newTicketType.price <= 0 ||
            newTicketType.type === options.type[0] && +newTicketType.tripCount <= 0) {
            message('Увядзіце карэктныя значэнні');
            return;
        }
        if (+newTicketType.duration > 366) {
            message("Колькасць сутак павінна быць ня больш за 366");
            return;
        }
        if (+newTicketType.tripCount > 999) {
            message("Колькасць паездак павінна быць ня больш за 999");
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
                message('Такі тып білета ўжо існуе');
                return;
            }
            let data;
            if (newTicketType.type === options.type[0]) { // Если тип проездного на определенное количество поездок
                data = await request('/api/tickets/types', 'POST', { ...newTicketType, transport: newTicketType.transport.sort().join('-') });
            } else {
                data = await request('/api/tickets/types', 'POST', { ...newTicketType, transport: newTicketType.transport.sort().join('-'), tripCount: -1 });
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
        if (window.confirm('Выдаліць тып білета?')) {
            try {
                const data = await request(`/api/tickets/types/${id}`, 'DELETE');
                console.log(data);
                getTicketTypes();
            } catch (e) { }
        }
    }

    return (
        <div className='container'>
            {ticketTypes && AddTicketTypeForm({ readOnly: false, onClickHandler: AddTicketTypeHandler, options, setNewTicketType, newTicketType, btnText: 'Дадаць' })}
            {ticketTypes &&
                <table className="highlight">
                    <thead>
                        <tr>
                            <th>Тып бiлета</th>
                            <th>Транспарт</th>
                            <th>Колькасць паездак</th>
                            <th>Колькасць сутак</th>
                            <th>Кошт</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {ticketTypes.map(ticketType =>
                            <tr key={ticketType._id}>
                                <td>{ticketType.type}</td>
                                <td>{ticketType.transport}</td>
                                {ticketType.tripCount !== -1 ? <td>{ticketType.tripCount}</td> : <td>-</td>}
                                <td>{ticketType.duration}</td>
                                <td>{ticketType.price}</td>
                                <td><a href={'/admin/tickets/' + ticketType._id}>Змянiць</a></td>
                                <td><button onClick={(e) => DeleteTicketTypeHandler(ticketType._id)} className="waves-effect waves-light btn-small">Выдалiць</button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            }
        </div>
    )
}