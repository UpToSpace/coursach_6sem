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
    const [schedule, setSchedule] = useState(null);
    const [routeStops, setRouteStops] = useState();
    const [newSchedule, setNewSchedule] = useState([]);

    useEffect(() => {
        M.updateTextFields()
    }, [])

    const getSchedule = useCallback(async () => {
        try {
            const data = await request(`/api/schedule?type=${transport.transportType}&number=${transport.number}`, 'GET', null, {
                Authorization: `Bearer ${auth.token}`
            });
            const routeStops = await request(`/api/routes?type=${transport.transportType}&number=${transport.number}`, 'GET', null, {
                Authorization: `Bearer ${auth.token}`
            });
            setRouteStops(routeStops);
            setSchedule(data);
            console.log(data);
        } catch (e) { }
    }, [auth.token, request, transport]);

    const FindTransportHandler = async () => {
        if (transport.transportType === null) {
            return window.alert('Тип транспорта не выбран')
        }
        if (transport.number === null || !(new RegExp(/^\d{1,3}[сэдав]?$/).test(transport.number))) {
            return window.alert('Номер транспорта введен некорректно')
        }
        let transportFromDB = await request(`/api/transports?type=${transport.transportType}&number=${transport.number}`, 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        if (!transportFromDB) {
            return window.alert('Транспорт не найден')
        }
        getSchedule();
    }

    const handleChange = (event) => {
        event.target.name === "transportType" ? setTransport({ ...transport, [event.target.name]: event.target.value.value }) :
            setTransport({ ...transport, [event.target.name]: event.target.value });
    }

    if (loading) {
        return <Loader />
    }

    const scheduleHandleChange = (event, item) => {
        const index = newSchedule.findIndex(scheduleItem => scheduleItem.routeStopId === item._id);
        if (index === -1) {
            // Add a new item
            setNewSchedule([...newSchedule, { arrivalTime: event.target.value, routeStopId: item._id }]);
        } else {
            // Update an existing item
            const updatedSchedule = [...newSchedule];
            updatedSchedule[index].arrivalTime = event.target.value;
            setNewSchedule(updatedSchedule);
        }
    }


    const AddScheduleHandler = async () => {
        console.log(newSchedule)
        console.log(routeStops.length)
        if (newSchedule.length !== routeStops.length) {
            return window.alert('Не все остановки заполнены')
        }
        for (let i = 0; i < newSchedule.length; i++) {
            console.log(newSchedule[i])
            if (!(new RegExp(/^([01]\d|2[0-3]):([0-5]\d)$/).test(newSchedule[i].arrivalTime))) {
                return window.alert(`Время прибытия на остановку ${routeStops[i].stopId.name} введено некорректно`)
            }
        }
        console.log(schedule)
        const scheduleNumber = schedule.length === 0 ? 0 : schedule.sort(e => e.scheduleNumber)[schedule.length - 1].scheduleNumber + 1;
        console.log(scheduleNumber)
        const data = await request('/api/schedule', 'POST', { schedule: newSchedule, scheduleNumber: scheduleNumber }, {
            Authorization: `Bearer ${auth.token}`
        });
        console.log(data)
        getSchedule();
    }

    const scheduleTable = (schedule) => {
        return (
            <>
                <table>
                    <tbody>
                        {
                            routeStops.sort(e => e.stopOrder).map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <th>{item.stopId.name}</th>
                                        <td>
                                            <div style={{ width: "60px" }}>
                                                <input placeholder="06:09" pattern="[0-2][0-9]:[0-5][0-9]" onChange={(e) => scheduleHandleChange(e, item)} type="text" className="validate" />
                                            </div>
                                        </td>
                                        {/* {console.log(schedule)}
                                        {console.log(item)}
                                        {console.log(schedule.filter(e => e.routeStopId._id === item._id).sort(e => e.scheduleNumber))} */}
                                        {schedule.filter(e => e.routeStopId._id === item._id).sort(e => e.scheduleNumber).map((item, index) => {
                                            return (
                                                <td key={index}>{item.arrivalTime}</td>
                                            )
                                        })}
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                <button onClick={AddScheduleHandler} className="waves-effect waves-light btn-small">Добавить</button>\
            </>
        )
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
            {schedule && scheduleTable(schedule)}
        </div>
    )
}