import React from 'react';
import { useState, useEffect } from 'react';
import { useHttp } from '../hooks/http.hook';
import { transportTypes } from './arrays';

export const SelectedStopInfo = ({ stop, showTransportRoute }) => {
    const { loading, request } = useHttp();
    const [busList, setBusList] = useState([]);
    const [trolleybusList, setTrolleybusList] = useState([]);
    const [tramList, setTramList] = useState([]);

    useEffect(() => {
        const getTransports = async () => {
            try {
                const data = await request(`/api/transports/${stop._id}`, 'GET', null);
                setBusList(data.filter(e => e.type === transportTypes[0]));
                setTrolleybusList(data.filter(e => e.type === transportTypes[1]));
                setTramList(data.filter(e => e.type === transportTypes[2]));
                console.log(data);
            } catch (error) {
                console.error('Error fetching transport data:', error);
            }
        };
        getTransports();
    }, [stop._id]);

    // console.log(transportList);

    return (
        <div className="selectedstopinfo">
            <h5 className="stop-name">{stop.name}</h5>
            <div className="transport-buttons">
                {busList.length !== 0 && <div className='bus-list'>
                    <h6>{transportTypes[0]}</h6>
                    {busList.map((transport, index) => (
                        <button key={index} className="transport-button" onClick={() => showTransportRoute(transport, stop)}>
                            {transport.number}
                        </button>
                    ))}
                </div>}
                {trolleybusList.length !== 0 && <div className='trolleybus-list'>
                    <h6>{transportTypes[1]}</h6>
                    {trolleybusList.map((transport, index) => (
                        <button key={index} className="transport-button" onClick={() => showTransportRoute(transport, stop)}>
                            {transport.number}
                        </button>
                    ))}
                </div>}
                {tramList !== 0 && <div className='tram-list'>
                    <h6>{transportTypes[2]}</h6>
                    {tramList.map((transport, index) => (
                        <button key={index} className="transport-button" onClick={() => showTransportRoute(transport, stop)}>
                            {transport.number}
                        </button>
                    ))}
                </div>}
            </div>
        </div>
    );
};