import { transportTypes } from './arrays'
import { useState } from 'react'
import heart from '../styles/images/heart.png'
import fullheart from '../styles/images/fullheart.png'

export const TransportTable = ({ transports, selectedTransportType, setSelectedTransportType, setRoutes,
    setRouteStops, setSchedule, showTransportRoute, selectedStop, favourites, addToFavourite,
    setSelectedTransport, selectedTransport, showOnlyFavourites }) => {
    const tabHandleClick = (type) => {
        //console.log(transports)
        setSelectedTransportType(type)
        setRouteStops(null);
        setSchedule(null);
        setRoutes(null);
    }

    return (
        <div className="row">
            <div className="col s10">
                <ul className="tabs">
                    {transportTypes.map((type, index) => {
                        return (
                            <li key={index} className={selectedTransportType === type ? "tab col s4 selected" : "tab col s4"}>
                                <a onClick={(e) => tabHandleClick(type)}>{type}</a></li>
                        )
                    })
                    }
                </ul>
            </div>
            {selectedTransportType &&
                <table className='transport-table'>
                    <thead>
                        <tr>
                            <th>Нумар</th>
                            <th>Пачатковы прыпынак</th>
                            <th>Канчатковы прыпынак</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {transports
                            .filter((e) => e.type === selectedTransportType && favourites.some((item) => item.transportId === e._id))
                            .sort((a, b) => +a.number > +b.number)
                            .map((transport, index) => (
                                <tr key={index} onClick={() => { showTransportRoute(transport, selectedStop); setSelectedTransport(transport) }}
                                    className={selectedTransport && selectedTransport._id === transport._id ? 'chosen favourite' : 'favourite'}>
                                    <td>{transport.number}</td>
                                    <td>{transport.routeStops.sort((a, b) => a.stopOrder - b.stopOrder)[0].stopId.name}</td>
                                    <td>{transport.routeStops.sort((a, b) => a.stopOrder - b.stopOrder)[transport.routeStops.length - 1].stopId.name}</td>
                                    <td>
                                        <div className="marker" onClick={() => addToFavourite(transport)}>
                                            <img src={fullheart} alt="marker" height="25px" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        {transports
                            .filter((e) => e.type === selectedTransportType && !favourites.some((item) => item.transportId === e._id))
                            .sort((a, b) => +a.number > +b.number)
                            .map((transport, index) => {
                                if (!showOnlyFavourites || selectedTransport?._id === transport._id) return (
                                <tr key={index} onClick={() => {showTransportRoute(transport, selectedStop); setSelectedTransport(transport)}} 
                                    className={selectedTransport && selectedTransport._id === transport._id ? 'not-favourite chosen' : 'not-favourite'}>
                                    <td>{transport.number}</td>
                                    <td>{transport.routeStops.sort((a, b) => a.stopOrder - b.stopOrder)[0].stopId.name}</td>
                                    <td>{transport.routeStops.sort((a, b) => a.stopOrder - b.stopOrder)[transport.routeStops.length - 1].stopId.name}</td>
                                    <td>
                                        <div className="marker" onClick={() => addToFavourite(transport)}>
                                            <img src={favourites.some((item) => item.transportId === transport._id) ? fullheart : heart} alt="marker" height="25px" />
                                        </div>
                                    </td>
                                </tr>
                            )})}
                    </tbody>
                </table>
            }
        </div>
    )
}