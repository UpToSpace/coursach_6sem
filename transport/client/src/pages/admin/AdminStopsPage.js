import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import M from 'materialize-css';

export const AdminStopsPage = () => { // TODO: returns a form adds a new stop
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [stop, setStop] = useState({
        name: '',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        M.updateTextFields();
    }, []);

    const OnChangeHandler = (event) => {
        setStop({ ...stop, [event.target.name]: event.target.value });
    };

    const AddStopHandler = async () => {
        if (!stop.name || !stop.latitude || !stop.longitude) {
            return window.alert('Заполните все поля');
        }
        if (!Number(stop.latitude) || !Number(stop.longitude)) {
            return window.alert('Неверный формат координат');
        }
        try {
            console.log(stop.name);
            const existStops = await request('/api/stops', 'GET', null, {
                Authorization: `Bearer ${auth.token}`
            })
            const existStop = existStops.filter((e) => e.name.toLowerCase() === stop.name.toLowerCase());
            console.log(existStop);
            if (existStop.length > 0) {
                return window.alert('Остановка с таким названием уже существует');
            }
            const { name, latitude, longitude } = stop;
            console.log(name, latitude, longitude);
            const data = await request('/api/stops', 'POST', { name, latitude, longitude }, {
                Authorization: `Bearer ${auth.token}`
            });
            window.alert('Остановка успешно добавлена ' + name);
            navigate('/admin');
        } catch (e) { }
    }

    const AddStopForm = () => {
        return (
            <div className="col s12 container">
                <div className="row">
                    <div className="input-field col s6">
                        <label>
                            Название остановки:</label>
                        <input type="text" className="validate" name="name" value={stop.name} onChange={OnChangeHandler} />

                    </div>
                </div>
                <div className="row">
                    <div className="input-field col s6">
                        <label>
                            Широта:</label>
                        <input type="text" className="validate" name="latitude" value={stop.latitude} onChange={OnChangeHandler} />

                    </div>
                </div>
                <div className="row">
                    <div className="input-field col s6">
                        <label>
                            Долгота:</label>
                        <input type="text" className="validate" name="longitude" value={stop.longitude} onChange={OnChangeHandler} />
                    </div>
                </div>
                <div className="row">
                <button onClick={AddStopHandler} className="waves-effect waves-light btn-large">Добавить</button>
                </div>
            </div>
        )
    }

    if (loading) {
        return <Loader />
    }

    return (
        AddStopForm()
    )
}
