import React from 'react';
import { useState, useEffect } from 'react';
import { useHttp } from '../hooks/http.hook';
import { findClosestTimes } from './../components/functions';

export const SelectedStopInfo = ({ 
    stop, showTransportRoute, favourites, selectedTransport, 
    setSelectedTransport, showOnlyFavourites }) => {
        
    const { loading, request } = useHttp();
    const [transportList, setTransportList] = useState(null);

    useEffect(() => {
        const getTransports = async () => {
            try {
                const data = await request(`/api/transports/${stop._id}`, 'GET', null);
                setTransportList(data);
                //console.log(data);
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
                <table className='transport-table'>
                    <thead>
                        <tr>
                            <th>Нумар</th>
                            <th>Канчатковы прыпынак</th>
                            <th>Блiж.</th>
                            <th>Наст.</th>
                        </tr>
                    </thead>

                    <tbody>
                        {transportList && transportList
                            .filter((e) => favourites.some((item) => item.transportId === e._id))
                            .sort((a, b) => +a.number > +b.number)
                            .map((transport, index) => {
                            //console.log(transport)
                            const currentStopRouteStops = transport.routeStops.filter(routeStop => routeStop.stopId._id === stop._id)[0];
                            if (currentStopRouteStops !== undefined) {
                                return <tr key={index} onClick={() => { showTransportRoute(transport, stop); setSelectedTransport(transport) } } 
                                    className={selectedTransport && selectedTransport._id === transport._id ? 'chosen favourite' : 'favourite'}>
                                    <td>{transport.type[0] + transport.number}</td>
                                    <td>{transport.routeStops.sort(e => e.stopOrder)[transport.routeStops.length - 1].stopId.name}</td>
                                    <td>{(currentStopRouteStops?.schedule.length !== 0 && findClosestTimes(currentStopRouteStops.schedule).minutesUntilClosestTime) || '-'}</td>
                                    <td>{(currentStopRouteStops?.schedule.length !== 0 && findClosestTimes(currentStopRouteStops.schedule).minutesUntilNextTime) || '-'}</td>
                                </tr>
                            }
                        })}
                        {!showOnlyFavourites && transportList && transportList
                            .filter((e) => !favourites.some((item) => item.transportId === e._id))
                            .sort((a, b) => +a.number > +b.number)
                            .map((transport, index) => {
                                //console.log(transport)
                                //console.log(selectedTransport)
                                const currentStopRouteStops = transport.routeStops.filter(routeStop => routeStop.stopId._id === stop._id)[0];
                                if (currentStopRouteStops !== undefined) {
                                    return <tr key={index} onClick={() => { showTransportRoute(transport, stop); setSelectedTransport(transport) }} 
                                        className={selectedTransport && selectedTransport._id === transport._id ? 'not-favourite chosen' : 'not-favourite'}>
                                        <td>{transport.type[0] + transport.number}</td>
                                        <td>{transport.routeStops.sort(e => e.stopOrder)[transport.routeStops.length - 1].stopId.name}</td>
                                        <td>{(currentStopRouteStops?.schedule.length !== 0 && findClosestTimes(currentStopRouteStops.schedule).minutesUntilClosestTime) || '-'}</td>
                                        <td>{(currentStopRouteStops?.schedule.length !== 0 && findClosestTimes(currentStopRouteStops.schedule).minutesUntilNextTime) || '-'}</td>
                                    </tr>
                                }
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};