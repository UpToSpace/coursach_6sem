import React from 'react';
import { useState, useEffect } from 'react';
import { useHttp } from '../hooks/http.hook';

export const SelectedStopInfo = ({ stop, showTransportRoute }) => {
    const { loading, request } = useHttp();
    const [transportList, setTransportList] = useState([]);

    useEffect(() => {
        const getTransports = async () => {
            try {
                const data = await request(`/api/transports/${stop._id}`, 'GET', null);
                setTransportList(data);
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
                {transportList.map((transport, index) => (
                    <button key={index} className="transport-button" onClick={() => showTransportRoute(transport, stop)}>
                        {transport.number}
                    </button>
                ))}
            </div>
        </div>
    );
};