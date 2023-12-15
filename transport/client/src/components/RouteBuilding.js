import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../hooks/http.hook';
import { useMessage } from '../hooks/message.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import Select from 'react-select';
import { reactSelectStyles } from '../styles/styles';
import { set } from 'mongoose';

export const RouteBuilding = ({ stops, setSelectedTransport, showTransportRoute }) => {

    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const message = useMessage();
    const [stopPoints, setStopPoints] = useState({ startStop: '', endStop: '' });
    const [options, setOptions] = useState([])

    useEffect(() => {
        if (stops) {
            const uniqueStops = Array.from(new Set(stops.map(type => type.name))).map(name => {
                return {
                    value: name,
                    label: name
                }
            })
            setOptions(uniqueStops);
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
        console.log(stopPoints)
        setStopPoints({ ...stopPoints, [event.target.name]: event.target.value.value });
    }

    return (
        <div className='chooseroute-form'>
            <Select
                styles={reactSelectStyles}
                onChange={(startStop) => handleChange({
                    target: {
                        name: "startStop",
                        value: startStop
                    }
                })}
                options={options}
                isOptionDisabled={(option) => option.value === stopPoints.endStop}
                openMenuOnClick={false}
                menuPortalTarget={document.body}
                maxMenuHeight={"200px"}
            />
            <Select
                styles={reactSelectStyles}
                onChange={(endStop) => handleChange({
                    target: {
                        name: "endStop",
                        value: endStop
                    }
                })}
                options={options}
                openMenuOnClick={false}
                isOptionDisabled={(option) => option.value === stopPoints.startStop}
                menuPortalTarget={document.body}
                maxMenuHeight={"200px"}
            />
            <button className="waves-effect waves-light btn-large" onClick={getTransportByStops}>Паказаць маршрут</button>
        </div>
    )
}