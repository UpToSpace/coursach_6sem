import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    MAP_TOKEN, BaseMap
} from '../components/MapComponents';
import { TransportTable } from '../components/TransportTable';
import { SelectedStopInfo } from '../components/SelectedStopInfo';
import { useMessage } from '../hooks/message.hook';
import { transportTypes } from '../constants/constants';
import { RouteBuilding } from '../components/RouteBuilding';
import cancelIcon from '../styles/images/cancel.svg';
import { findNearestStops } from '../components/functions';

export const MapPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const message = useMessage();
    const [stops, setStops] = useState([]);
    const [routes, setRoutes] = useState([]); // routes for selected transport
    const [selectedStop, setSelectedStop] = useState(null);
    const [transports, setTransports] = useState([]);
    const [selectedTransportType, setSelectedTransportType] = useState(transportTypes[0]);
    const [selectedTransport, setSelectedTransport] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [routeStops, setRouteStops] = useState([]);
    const [stop, setStop] = useState({
        name: '',
        latitude: '',
        longitude: ''
    });
    const [addStopHandler, setAddStopHandler] = useState(false);
    const [foundStops, setFoundStops] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [nearestStops, setNearestStops] = useState([]);
    const [showOnlyFavourites, setShowOnlyFavourites] = useState(false);

    const getTransports = useCallback(async () => {
        const data = await request('/api/transports', 'GET', null);
        setTransports(data);
        console.log(data);
    }, [auth.token, request])

    const getStops = useCallback(async () => {
        const data = await request('/api/stops', 'GET', null);
        setStops(data);
        //console.log(data);
    }, [auth.token, request])

    const getSchedule = async (transport) => {
        const schedule = await request(`/api/schedule?type=${transport.type}&number=${transport.number}`, 'GET', null);
        const routeStops = await request(`/api/routes?type=${transport.type}&number=${transport.number}`, 'GET', null);
        setSchedule(schedule);
        console.log(schedule);
        setRouteStops(routeStops); //
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
        const routeStopsForRequest = transport.routeStops.sort(e => e.stopOrder).map((stop) => `${stop.stopId.longitude},${stop.stopId.latitude}`).join(';');
        try {
            const data = await request(`https://api.mapbox.com/directions/v5/mapbox/driving/${routeStopsForRequest}?steps=true&geometries=geojson&access_token=${MAP_TOKEN}`)
            setRoutes(data.routes[0].geometry.coordinates);
        } catch (e) {
            message(e.message);
        }
        await getSchedule(transport)
        setSelectedStop(stop)
    }

    const checkboxHandleChange = (event) => {
        setShowOnlyFavourites(event.target.checked)
        if (selectedTransport && favourites.filter(e => e.transportId === selectedTransport._id).length === 0) {
            setRouteStops([])
            setSelectedTransportType(transportTypes[0])
            setSelectedTransport(null)
            setRoutes(null)
        }
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
                    <p>
                        <label>
                            <input type="checkbox" className="filled-in" onChange={checkboxHandleChange} checked={showOnlyFavourites} />
                            <span>Толькi любiмыя</span>
                        </label>
                    </p>
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
                            routeStops?.sort(e => e.stopOrder).map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <th>{item.stopId.name}</th>
                                        {/* {console.log(schedule)}
                                        {console.log(item)}
                                        {console.log(schedule.filter(e => e.routeStopId._id === item._id).sort(e => e.scheduleNumber))} */}

                                        {schedule.length !== 0 && schedule.filter(e => e.routeStopId._id === item._id)
                                            .sort((a, b) => {
                                                if (a.arrivalTime < b.arrivalTime) {
                                                    return -1; // a should be sorted before b
                                                } else if (a.arrivalTime > b.arrivalTime) {
                                                    return 1; // b should be sorted before a
                                                } else {
                                                    return 0; // the order of a and b remains unchanged
                                                }
                                            })
                                            .map((item, index) => {
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
            if (!favourite) {
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
        console.log(e)
        const nearestStops = findNearestStops(e.coords.latitude, e.coords.longitude, stops);
        setNearestStops(nearestStops);
    }

    return (
        stops &&
        <div className="schedule">
            {AddStopForm()}
            <div className="line">
                <BaseMap
                    setNearestStops={setNearestStops}
                    FindNearestStopsHandler={FindNearestStopsHandler}
                    foundStops={foundStops}
                    openPopup={openPopup}
                    routeStops={routeStops}
                    stops={stops}
                    nearestStops={nearestStops}
                    user={true}
                    showTransportRoute={showTransportRoute}
                    favourites={favourites}
                    selectedTransport={selectedTransport}
                    setSelectedTransport={setSelectedTransport}
                    showOnlyFavourites={showOnlyFavourites}
                >
                </BaseMap>
                {selectedStop &&
                    <SelectedStopInfo
                        stop={selectedStop}
                        showTransportRoute={showTransportRoute}
                        favourites={favourites}
                        selectedTransport={selectedTransport}
                        setSelectedTransport={setSelectedTransport}
                        showOnlyFavourites={showOnlyFavourites}
                    />}
                {transports && TransportTable({
                    transports, selectedTransportType, setSelectedTransportType,
                    setRoutes, setRouteStops, setSchedule, showTransportRoute, selectedStop, favourites, addToFavourite,
                    setSelectedTransport, selectedTransport, showOnlyFavourites
                })}
            </div>
            {stops?.length !== 0 && <RouteBuilding stops={stops} setSelectedTransport={setSelectedTransport} showTransportRoute={showTransportRoute} />}
            {routeStops?.length !== 0 && selectedTransport && <h5>Расклад на {selectedTransport.number} {selectedTransport.type}</h5>}
            {routeStops?.length !== 0 && ScheduleTable()}
        </div >
    )
}
