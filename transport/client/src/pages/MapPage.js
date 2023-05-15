import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import Map, { Marker, Popup, Source } from 'react-map-gl';
import ReactMapGL, {
    FullscreenControl,
    GeolocateControl,
    Layer,
} from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    MAP_TOKEN, geolocateControlStyle, fullscreenControlStyle, CustomMarker, CustomPopup,
    ROUTE_LAYER, CENTER, ZOOM
} from '../components/MapComponents';
import { TransportTable } from '../components/TransportTable';

export const MapPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState();
    const [routes, setRoutes] = useState(); // routes for selected transport
    const [selectedStop, setSelectedStop] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: ZOOM
    });
    const [transports, setTransports] = useState();
    const [selectedTransportType, setSelectedTransportType] = useState(null);
    const [selectedTransport, setSelectedTransport] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [routeStops, setRouteStops] = useState();

    const getTransports = useCallback(async () => {
        const data = await request('/api/transports', 'GET', null);
        setTransports(data);
        console.log(data);
    }, [auth.token, request])

    const getStops = useCallback(async () => {
        const data = await request('/api/stops', 'GET', null);
        setStops(data);
        console.log(data);
    }, [auth.token, request])

    const getSchedule = async (transport) => {
        const schedule = await request(`/api/schedule?type=${transport.type}&number=${transport.number}`, 'GET', null);
        const routeStops = await request(`/api/routes?type=${transport.type}&number=${transport.number}`, 'GET', null);
        setSchedule(schedule);
        setRouteStops(routeStops);
        console.log(schedule);
        console.log(routeStops);
    }

    useEffect(() => {
        getStops();
        getTransports();
    }, [getStops, getTransports])

    if (loading) {
        return <Loader />
    }

    const closePopup = () => {
        setSelectedStop(null)
    };

    const openPopup = (stop) => {
        setSelectedStop(stop)
    }

    const ScheduleTable = () => {
        console.log(routeStops)
        console.log(schedule)
        return (
            <>
                <table>
                    <tbody>
                        {
                            routeStops && routeStops.sort(e => e.stopOrder).map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <th>{item.stopId.name}</th>
                                        {/* {console.log(schedule)}
                                        {console.log(item)}
                                        {console.log(schedule.filter(e => e.routeStopId._id === item._id).sort(e => e.scheduleNumber))} */}
                                        {schedule.length !== 0 && schedule.filter(e => e.routeStopId._id === item._id).sort(e => e.scheduleNumber).map((item, index) => {
                                            return (
                                                <td key={index}>{item.arrivalTime}</td>
                                            )
                                        })}
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </>
        )
    }

    return (
        stops &&
        <div className="schedule">
            <div className="line">
                <ReactMapGL
                    {...viewState}
                    onMove={event => setViewState(event.viewState)}
                    style={{ width: "50%", height: 600 }}
                    mapboxAccessToken={MAP_TOKEN}
                    mapStyle="mapbox://styles/mapbox/streets-v9"
                >
                    <FullscreenControl style={fullscreenControlStyle} />
                    <GeolocateControl
                        style={geolocateControlStyle}
                        positionOptions={{ enableHighAccuracy: true }}
                        trackUserLocation={true}
                        auto={false}
                    />
                    stops && {stops.map(stop => {
                        return (
                            <CustomMarker
                                key={stop._id}
                                stop={stop}
                                openPopup={openPopup}
                            />
                        )
                    })}
                    {selectedStop !== null &&
                        <CustomPopup
                            stop={selectedStop}
                            closePopup={closePopup}
                        />}

                    {routes && (
                        <Source id="track" type="geojson" data={{
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: routes
                            }
                        }}>
                            <Layer {...ROUTE_LAYER} />
                        </Source>
                    )}
                </ReactMapGL>
                {transports && TransportTable({
                    transports, selectedTransportType, setSelectedTransportType, setSelectedTransport,
                    setRoutes, getSchedule, setRouteStops, setSchedule
                })}
            </div>
            {routeStops && <h5>Расклад</h5>}
            {routeStops && ScheduleTable()}
        </div >
    )
}
