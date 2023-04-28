import { transportTypes } from './arrays'
import { useState } from 'react'
import { MAP_TOKEN } from './MapComponents'

export const TransportTable = ({ transports, selectedTransportType, setSelectedTransportType, setSelectedTransport, setRoutes }) => {
    const tabHandleClick = (type) => {
        console.log(transports)
        setSelectedTransportType(type)
    }

    const transportHandleClick = (transport) => {
        setSelectedTransport(transport)
        console.log(transport)
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${transport.routeStops.sort(e => e.stopOrder).map((stop) => `${stop.stopId.longitude},${stop.stopId.latitude}`).join(';')}?steps=true&geometries=geojson&access_token=${MAP_TOKEN}`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            setRoutes(data.routes[0].geometry.coordinates);
        })
        .catch((error) => console.error(error));
    }

    return (
        <div className="row">
            <div className="col s12">
                <ul className="tabs">
                    {transportTypes.map((type, index) => {
                        return (
                            <li key={index} className="tab col s3"><a onClick={(e) => tabHandleClick(type)}>{type}</a></li>
                        )
                    })
                    }
                </ul>
            </div>
            {selectedTransportType &&
                <table>
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Начальная остановка</th>
                            <th>Конечная остановка</th>
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
                                <td><button className="btn waves-effect waves-light" onClick={() => transportHandleClick(transport)}>Посмотреть маршрут</button></td>
                            </tr>
                        })}
                    </tbody>
                </table>
            }
        </div>
    )
}