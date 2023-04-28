import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { transportTypes } from "../../components/arrays"
import M from 'materialize-css';
import Select from 'react-select';

export const AdminSchedulePage = () => {
    const { loading, request, error } = useHttp();
    const auth = useContext(AuthContext);
    const [transport, setTransport] = useState({
        transportType: null,
        number: null
    });
    const [schedule, setSchedule] = useState();

    const getSchedule = useCallback(async () => {
        const data = await request('/api/schedule', 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        //setStops(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        M.updateTextFields()
    }, [])

    const FindTransportHandler = async () => {
        if (transport.transportType === null) {
            return window.alert('Тип транспорта не выбран')
        }
        if (transport.number === null || !(new RegExp(/^\d{1,3}[сэдав]?$/).test(transport.number))) {
            return window.alert('Номер транспорта введен некорректно')
        }
        try {
            const data = await request(`/api/schedule?type=${transport.transportType}&number=${transport.number}`, 'GET', null, {
                Authorization: `Bearer ${auth.token}`
            });
            if (data.length === 0) {
                const routeStops = await request(`/api/routes?type=${transport.transportType}&number=${transport.number}`, 'GET', null, {
                    Authorization: `Bearer ${auth.token}`
                });
            }
            setSchedule(data);
            console.log(data);
        } catch (e) { }
    }

    const handleChange = (event) => {
        event.target.name === "transportType" ? setTransport({ ...transport, [event.target.name]: event.target.value.value }) :
            setTransport({ ...transport, [event.target.name]: event.target.value });
    }

    if (loading) {
        return <Loader />
    }

    return (
        <div>
            <div>
                <Select
                    value={transport.transport}
                    onChange={(transport) => handleChange({
                        target: {
                            name: "transportType",
                            value: transport
                        }
                    })}
                    options={transportTypes.map((type, index) => {
                        return { value: type, label: type }
                    })}
                />
            </div>
            <div className="input-field col s12">
                <label>Номер</label>
                <input placeholder="" name="number" type="text" defaultValue={transport.number} className="validate" onChange={handleChange} />
            </div>
            <button onClick={FindTransportHandler} className="waves-effect waves-light btn-small">Найти</button>
        </div>
    )
}