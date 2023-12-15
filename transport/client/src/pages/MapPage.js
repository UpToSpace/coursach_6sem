import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import Map, { Marker, Popup, Source } from 'react-map-gl';
import flagIcon from "../styles/images/flag.svg"
import redflagIcon from "../styles/images/redflag.svg"
import searchIcon from "../styles/images/search.svg"
import cancelIcon from "../styles/images/cancel.svg"
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
import { SelectedStopInfo } from '../components/SelectedStopInfo';
import { useMessage } from '../hooks/message.hook';
import { transportTypes } from '../components/arrays';
import { RouteBuilding } from '../components/RouteBuilding';

export const MapPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const message = useMessage();
    const [stops, setStops] = useState();
    const [routes, setRoutes] = useState(); // routes for selected transport
    const [selectedStop, setSelectedStop] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: ZOOM
    });
    const [transports, setTransports] = useState();
    const [selectedTransportType, setSelectedTransportType] = useState(transportTypes[0]);
    const [selectedTransport, setSelectedTransport] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [routeStops, setRouteStops] = useState();
    const [stop, setStop] = useState({
        name: '',
        latitude: '',
        longitude: ''
    });
    const [addStopHandler, setAddStopHandler] = useState(false);
    const [foundStops, setFoundStops] = useState(null);
    const [favourites, setFavourites] = useState(null);
    const [nearestStops, setNearestStops] = useState(null);

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

    const getFavourites = useCallback(async () => {
        const data = await request('/api/favourites/' + auth.userId, 'GET', null);
        setFavourites(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getStops();
        getTransports();
        getFavourites();
    }, [getStops, getTransports, getFavourites])

    if (loading) {
        return <Loader />
    }

    const closePopup = () => {
        setSelectedStop(null)
    };

    const openPopup = (stop) => {
        setSelectedStop(stop)
    }

    const OnChangeHandler = (event) => {
        setStop({ ...stop, [event.target.name]: event.target.value });
        const foundStops = stops.filter(e => e.name.toLowerCase().includes(event.target.value.toLowerCase()));
        if (foundStops.length === 0 || event.target.value === '') {
            setFoundStops(null);
            return;
        }
        setFoundStops(foundStops);
    };

    const ClearButtonHandler = async () => {
        setFoundStops(null);
        setStop({ name: '', latitude: '', longitude: '' });
    }

    const showTransportRoute = async (transport, stop) => {
        setSelectedTransport(transport)
        //console.log(transport)
        setSelectedTransportType(transport.type)
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${transport.routeStops.sort(e => e.stopOrder).map((stop) => `${stop.stopId.longitude},${stop.stopId.latitude}`).join(';')}?steps=true&geometries=geojson&access_token=${MAP_TOKEN}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
                setRoutes(data.routes[0].geometry.coordinates);
            })
            .catch((error) => console.error(error));
        await getSchedule(transport)
        setSelectedStop(stop)
    }

    const AddStopForm = () => {
        return (
            <div className="col s12 container">
                <div className="row">
                    <div className="input-field col s6">
                        <label>
                            Назва прыпынка:</label>
                        <input type="text" className="validate" maxLength={30} name="name" value={stop.name} onChange={OnChangeHandler} />
                    </div>
                    <img src={cancelIcon} onClick={ClearButtonHandler} className='icon-button' />
                </div>
            </div>
        )
    }

    const ScheduleTable = () => {
        console.log(routeStops)
        console.log(schedule)
        return (
            <>
                <table className="highlight">
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

    const addToFavourite = async (transport) => {
        try {
            const favourite = favourites.filter(item => item.transportId === transport._id)[0];
            console.log(favourite)
            if (favourite === undefined) {
                const data = await request('/api/favourites', 'POST', { userId: auth.userId, transportId: transport._id });
                message(data.message);
            } else {
                const data = await request('/api/favourites/' + favourite._id, 'DELETE');
                message(data.message);
            }
            getFavourites();
        } catch (e) { }
    }

    const FindNearestStopsHandler = (e) => {
        const R = 6371; // Earth radius in kilometers
        const stopAmount = 5;
        // Calculate distances to all stops
        const distances = stops.map(stop => {
            const lat1 = e.coords.latitude; // User latitude
            const lon1 = e.coords.longitude; // User longitude
            const lat2 = stop.latitude;
            const lon2 = stop.longitude;

            const dLat = degToRad(lat2 - lat1);
            const dLon = degToRad(lon2 - lon1);

            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c; // Distance in kilometers
            return { stop, distance };
        });

        // Sort distances in ascending order
        distances.sort((a, b) => a.distance - b.distance);

        // Get the three nearest stops
        const nearestStops = distances.slice(0, stopAmount).map(item => item.stop);

        setNearestStops(nearestStops);
    }

    function degToRad(deg) {
        return deg * (Math.PI / 180);
    }

    return (
        stops &&
        <div className="schedule">
            {AddStopForm()}
            <div className="line">
                <ReactMapGL
                    {...viewState}
                    onMove={event => setViewState(event.viewState)}
                    style={{ width: "55%", height: 500 }}
                    mapboxAccessToken={MAP_TOKEN}
                    mapStyle="mapbox://styles/mapbox/streets-v9"   
                >
                    <FullscreenControl style={fullscreenControlStyle} />
                    <GeolocateControl
                        style={geolocateControlStyle}
                        positionOptions={{ enableHighAccuracy: true }}
                        trackUserLocation={true}
                        auto={false}
                        onGeolocate={FindNearestStopsHandler}
                        onTrackUserLocationEnd={() => setNearestStops([])}
                    />
                    {foundStops && foundStops.map(foundStop => {
                        return (<CustomMarker
                            key={foundStop._id}
                            stop={foundStop}
                            openPopup={openPopup}
                            icon={flagIcon}
                            height={ZOOM * 2 + "px"}
                        />)
                    })}
                    {stops.map(stop => {
                        return (
                            <CustomMarker
                                key={stop._id}
                                stop={stop}
                                openPopup={openPopup}
                            />
                        )
                    })}
                    {nearestStops && nearestStops.map(stop => {
                        return (
                            <CustomMarker
                                key={stop._id}
                                stop={stop}
                                openPopup={openPopup}
                                icon={redflagIcon}
                                height={ZOOM * 2 + "px"}
                            />
                        )
                    })}
                    {selectedStop !== null &&
                        <CustomPopup
                            stop={selectedStop}
                            closePopup={closePopup}
                        />}

                    {(routes || selectedStop !== null) && (
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
                {selectedStop !== null &&
                    <SelectedStopInfo
                        stop={selectedStop}
                        showTransportRoute={showTransportRoute}
                        favourites={favourites}
                        selectedTransport={selectedTransport}
                        setSelectedTransport={setSelectedTransport}
                    />}
                {transports && TransportTable({
                    transports, selectedTransportType, setSelectedTransportType,
                    setRoutes, setRouteStops, setSchedule, showTransportRoute, selectedStop, favourites, addToFavourite, 
                    setSelectedTransport, selectedTransport
                })}
            </div>
            {stops && <RouteBuilding stops={stops} setSelectedTransport={setSelectedTransport} showTransportRoute={showTransportRoute}/>}
                {routeStops && <h5>Расклад на {selectedTransport.number} {selectedTransport.type}</h5>}
            {routeStops && ScheduleTable()}
        </div >
    )
}
