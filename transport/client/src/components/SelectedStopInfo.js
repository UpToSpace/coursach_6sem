import React from 'react';
import { useState, useEffect } from 'react';
import { useHttp } from '../hooks/http.hook';
import { transportTypes } from './arrays';

export const SelectedStopInfo = ({ stop, showTransportRoute }) => {
    const { loading, request } = useHttp();
    const [transportList, setTransportList] = useState(null);

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
            <h5 className="stop-name">Прыпынак: <br />{stop.name}</h5>
            <div className="row">
                <table className='transport-table highlight'>
                    <thead>
                        <tr>
                            <th>Нумар</th>
                            <th>Канчатковы прыпынак</th>
                            <th>Блiж.</th>
                            <th>Наст.</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transportList && transportList.map((transport, index) => {
                            console.log(transport)
                            return <tr key={index} onClick={() => showTransportRoute(transport, stop)} >
                                <td>{transport.type[0] + transport.number}</td>
                                <td>{transport.routeStops.sort(e => e.stopOrder)[transport.routeStops.length - 1].stopId.name}</td>
                                <td>{}</td>
                                <td></td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};