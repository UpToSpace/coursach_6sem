import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import Select from 'react-select';
import { set } from 'mongoose';

export const RouteBuilding = ({ stops, setSelectedTransport, showTransportRoute }) => {

    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const message = useMessage();
    const [stopPoints, setStopPoints] = useState({ startStop: '', endStop: '' });
    const [stopNames, setStopNames] = useState([]);

    useEffect(() => {
        if (stops) {
            const uniqueStops = Array.from(new Set(stops.map(type => type.name)))
            setStopNames(uniqueStops);
        }
    }, [stops]);

    const getTransportByStops = async () => {
        if (stopPoints.startStop === '' || stopPoints.endStop === '') {
            message('Запоўнiце пустыя палi');
            return;
        }
        if (stopPoints.startStop === stopPoints.endStop) {
            message('Початковая і канчатковая спынкі не могуць быць аднолькавымі');
            return;
        }
        try {
            const data = await request('/api/transports/routes/stops?startStop=' + stopPoints.startStop + '&endStop=' + stopPoints.endStop, 'GET', null);
            setSelectedTransport(data);
            showTransportRoute(data, null);
            console.log(data);
        } catch (e) {
            message(e.message);
        }
    }

    const handleChange = async (event) => {
        //console.log(stopPoints)
        setStopPoints({ ...stopPoints, [event.target.name]: event.target.value.value });
    }

    return (
        <>
            <Select
                onChange={(startStop) => handleChange({
                    target: {
                        name: "startStop",
                        value: startStop
                    }
                })}
                options={stopNames.map((type, index) => {
                    return { value: type, label: type }
                })}
                menuPortalTarget={document.body}
            />
            <Select
                onChange={(endStop) => handleChange({
                    target: {
                        name: "endStop",
                        value: endStop
                    }
                })}
                options={stopNames.map((type, index) => {
                    return { value: type, label: type }
                })}
                menuPortalTarget={document.body}
            />
            <button className="waves-effect waves-light btn-large" onClick={getTransportByStops}>Паказаць маршрут</button>
        </>
    )
}