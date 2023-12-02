import React, { useCallback, useContext, useEffect, useState} from "react";
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { transportTypes } from "../../components/arrays"
import M from 'materialize-css';
import Select from 'react-select';
import { useMessage } from "../../hooks/message.hook";

export const AdminSchedulePage = () => {
    const { loading, request, error } = useHttp();
    const message = useMessage()
    const auth = useContext(AuthContext);
    const [transport, setTransport] = useState({
        transportType: null,
        number: null
    });
    const [schedule, setSchedule] = useState(null);
    const [routeStops, setRouteStops] = useState();
    const [newSchedule, setNewSchedule] = useState([]);
    const [selectOnFocus, setSelectOnFocus] = useState(false)

    useEffect(() => {
        M.updateTextFields()
    }, [])

    const getSchedule = useCallback(async () => {
        try {
            const data = await request(`/api/schedule?type=${transport.transportType}&number=${transport.number}`);
            const routeStops = await request(`/api/routes?type=${transport.transportType}&number=${transport.number}`);
            setRouteStops(routeStops);
            setSchedule(data);
            M.updateTextFields()
            // console.log(data);
        } catch (e) { }
    }, [auth.token, request, transport]);

    const FindTransportHandler = async () => {
        if (transport.transportType === null) {
            return message('Тып транспарту ня абраны')
        }
        if (transport.number === null || !(new RegExp(/^\d{1,3}[сэдав]?$/).test(transport.number))) {
            return message('Нумар транспартнага сродку некарэктны')
        }
        let transportFromDB = await request(`/api/transports?type=${transport.transportType}&number=${transport.number}`);
        if (!transportFromDB) {
            return message('Транспартнага сродку не існуе')
        }
        await getSchedule();
        setNewSchedule([])
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
            return message('Не запоўненае расклад')
        }
        for (let i = 0; i < newSchedule.length; i++) {
            console.log(newSchedule[i])
            if (!(new RegExp(/^([01]\d|2[0-3]):([0-5]\d)$/).test(newSchedule[i].arrivalTime))) {
                return message(`Час прыбыта на прыпынак ${routeStops[i].stopId.name} некарэктны`)
            }
        }
        console.log(schedule)
        const scheduleNumber = schedule.length === 0 ? 0 : schedule.sort(e => e.scheduleNumber)[schedule.length - 1].scheduleNumber + 1;
        console.log(scheduleNumber)
        const data = await request('/api/schedule', 'POST', { schedule: newSchedule, scheduleNumber: scheduleNumber });
        console.log(data)
        setNewSchedule([]);
        await getSchedule();
    }

    const DeleteScheduleHandler = async (scheduleNumber, routeStops) => {
        if (window.confirm('Вы упэўнены, што хлчаце выдалiць расклад?')) {
            const data = await request('/api/schedule', 'DELETE', { scheduleNumber: scheduleNumber, routeStops: routeStops });
            await getSchedule();
        }
    }

    const scheduleTable = (schedule) => {
        const filteredSchedule = schedule.reduce((result, item) => {
            if (!result.some((e) => e.scheduleNumber === item.scheduleNumber)) {
                result.push(item);
            }
            return result;
        }, []);
        return (
            <>
                <table>
                    <tbody>
                        <tr><td></td><td></td>{filteredSchedule.map((item, index) => {
                            return (
                                <>
                                    <th key={index}><button onClick={(e) => DeleteScheduleHandler(item.scheduleNumber, routeStops)} className="waves-effect waves-light btn-small">Выдалiць</button></th>
                                </>
                            )
                        })}</tr>
                        {routeStops.sort(e => e.stopOrder).map((item, index) => {
                            return (
                                <>
                                    <tr key={index}>
                                        <th>{item.stopId.name}</th>
                                        <td>
                                            <div style={{ width: "60px" }}>
                                                <input placeholder="06:09" pattern="[0-2][0-9]:[0-5][0-9]" maxLength={5} onChange={(e) => scheduleHandleChange(e, item)} type="text" className="validate" />
                                            </div>
                                        </td>
                                        {/* {console.log(schedule)}
                                        {console.log(item)}
                                        {console.log(schedule.filter(e => e.routeStopId._id === item._id).sort(e => e.scheduleNumber))} */}
                                        {console.log(filteredSchedule)}
                                        {schedule.filter(e => e.routeStopId._id === item._id).sort(e => e.scheduleNumber).map((item, index) => {
                                            return (
                                                <>
                                                    <td key={index}>{item.arrivalTime}</td>
                                                </>
                                            )
                                        })}
                                    </tr>
                                </>
                            )
                        })
                        }
                    </tbody>
                </table>
                <button onClick={AddScheduleHandler} className="waves-effect waves-light btn-small">Дадаць</button>
            </>
        )
    }
    return (
        <div className="container" style={{ "marginBottom": "50px" }}>
            <div style={selectOnFocus ? { "marginBottom": "150px" } : undefined}>
                <Select
                    value={transport.transport}
                    onChange={(transport) => handleChange({
                        target: {
                            name: "transportType",
                            value: transport
                        }
                    })}
                    onMenuOpen={() => setSelectOnFocus(true)}
                    onMenuClose={() => setSelectOnFocus(false)}
                    options={transportTypes.map((type, index) => {
                        return { value: type, label: type }
                    })}
                />
            </div>
            <div className="input-field col s12">
                <label>Номер</label>
                <input placeholder="" name="number"  maxLength={5} type="text" defaultValue={transport.number} className="validate" onChange={handleChange} />
            </div>
            <button onClick={FindTransportHandler} className="waves-effect waves-light btn-small">Знайсцi</button>
            {schedule && scheduleTable(schedule)}
        </div>
    )
}