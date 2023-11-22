import { transportTypes } from './arrays'
import { useState } from 'react'
import { MAP_TOKEN } from './MapComponents'

export const TransportTable = ({ transports, selectedTransportType, setSelectedTransportType, setRoutes, 
    setRouteStops, setSchedule, showTransportRoute, selectedStop }) => {
    const tabHandleClick = (type) => {
        console.log(transports)
        setSelectedTransportType(type)
        setRouteStops(null);
        setSchedule(null);
        setRoutes(null);
    }

    return (
        <div className="row" style={{"width": "45%"}}>
            <div className="col s10">
                <ul className="tabs">
                    {transportTypes.map((type, index) => {
                        return (
                            <li key={index} className={selectedTransportType === type ? "tab col s3 selected" : "tab col s3"}>
                                <a onClick={(e) => tabHandleClick(type)}>{type}</a></li>
                        )
                    })
                    }
                </ul>
            </div>
            {selectedTransportType &&
                <table>
                    <thead>
                        <tr>
                            <th>Нумар</th>
                            <th>Пачатковы прыпынак</th>
                            <th>Канчатковы прыпынак</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {transports.filter(e => e.type === selectedTransportType).map((transport, index) => {
                            console.log(transport)
                            return <tr key={index}>
                                <td>{transport.number}</td>
                                <td>{transport.routeStops.sort(e => e.stopOrder)[0].stopId.name}</td>
                                <td>{transport.routeStops.sort(e => e.stopOrder)[transport.routeStops.length - 1].stopId.name}</td>
                                <td><button className="btn waves-effect waves-light" onClick={() => showTransportRoute(transport, selectedStop)}>Паглядзець маршрут</button></td>
                            </tr>
                        })}
                    </tbody>
                </table>
            }
        </div>
    )
}