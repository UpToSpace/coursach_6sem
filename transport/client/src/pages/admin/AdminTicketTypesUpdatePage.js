import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { useNavigate } from "react-router-dom";
import { AddTicketTypeForm } from '../../components/AddTicketTypeForm';
import { options } from '../../components/arrays';

export const AdminTicketTypesUpdatePage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const params = useParams()
    const navigate = useNavigate();
    const [newTicketType, setNewTicketType] = useState();

    const getTicketType = useCallback(async () => {
        const data = await request(`/api/tickets/types/${params.id}`, 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        data.transport = data.transport.split('-');
        setNewTicketType(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getTicketType();
    }, [getTicketType])

    if (loading) {
        return <Loader />
    }

    const UpdateHandler = () => {
        try {
            const data = request(`/api/tickets/types/${params.id}`, 'PUT', {...newTicketType}, {
                Authorization: `Bearer ${auth.token}`
            });
            console.log(data);
            navigate('/admin/tickets');
        } catch (e) { }
    }

    return (
        newTicketType && AddTicketTypeForm({readOnly: true, onClickHandler: UpdateHandler, options, setNewTicketType, newTicketType, btnText: 'Изменить стоимость'})
    )
}