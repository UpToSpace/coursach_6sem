import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../../hooks/http.hook';
import { useMessage } from '../../hooks/message.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
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
} from '../../components/MapComponents';
import { transportTypes } from "../../components/arrays"
import M from 'materialize-css';
import Select from 'react-select';
import { AdminSchedule } from '../../components/admin/AdminSchedule';
import flag from "../../styles/images/redflag.svg"
import { set } from 'mongoose';
import { reactSelectStyles } from '../../styles/styles';

export const AdminRoutesPage = () => {
    const { loading, request, error } = useHttp();
    const message = useMessage();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState();
    const [routes, setRoutes] = useState([]);
    const [routeStops, setRouteStops] = useState([]);
    const [transport, setTransport] = useState({
        transportType: transportTypes[0],
        number: 1
    });
    const [selectedStop, setSelectedStop] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: ZOOM
    });
    const [transportNumbers, setTransportNumbers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const getStops = useCallback(async () => {
        const data = await request('/api/stops');
        setStops(data);
        const numbers = await request('/api/transports/types/' + transportTypes[0]);
        setTransportNumbers(numbers);
    }, [auth.token, request])

    useEffect(() => {
        getStops();
        ShowRouteHandler(transport)
        M.updateTextFields()
    }, [getStops])

    if (loading) {
        return <Loader />
    }

    const closePopup = () => {
        setSelectedStop(null)
    };

    const fetchDirectionsForStops = (stops) => {
        const batchSize = 18; // Maximum number of stops per request
        const numBatches = Math.ceil(stops.length / batchSize);

        const requests = [];
        for (let i = 0; i < numBatches; i++) {
            const batch = stops.slice(i * batchSize, (i + 1) * batchSize);
            const coordinates = batch.map((stop) => `${stop.longitude},${stop.latitude}`).join(';');
            const request = fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?steps=true&geometries=geojson&access_token=${MAP_TOKEN}`)
                .then((res) => res.json());
            requests.push(request);
        }

        // Wait for all requests to finish
        Promise.all(requests)
            .then((responses) => {
                const routes = responses.flatMap((data) => data.routes[0].geometry.coordinates);
                setRoutes(routes);
            })
            .catch((error) => console.error(error));
    }

    const openPopup = (stop) => {
        console.log(showAddForm)
        setSelectedStop(stop)
        if (showAddForm) {
            if (routeStops.includes(stop)) {
                if (routeStops[routeStops.length - 1] !== stop) {
                    return message('Вы можаце выдалiць толькi апошнi прыпынак маршрута')
                } else {
                    setRouteStops((prev) => prev.filter((item) => item !== stop))
                    if (routeStops.length > 2) {
                        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${routeStops.filter((item) => item !== stop).map((stop) => `${stop.longitude},${stop.latitude}`).join(';')}?steps=true&geometries=geojson&access_token=${MAP_TOKEN}`)
                            .then((res) => res.json())
                            .then((data) => {
                                console.log([...routeStops, stop])
                                console.log(data)
                                setRoutes(data.routes[0].geometry.coordinates);
                            })
                            .catch((error) => console.error(error));
                    } else {
                        setRoutes([])
                    }
                }
            } else {
                setRouteStops((prev) => [...prev, stop])
                if (routeStops.length > 0) {
                    fetchDirectionsForStops([...routeStops, stop]);
                }
            }
        }
    }

    const handleChange = async (event) => {
        switch (event.target.name) {
            case "transportType":
                const numbers = await request('/api/transports/types/' + event.target.value.value);
                //console.log(numbers)
                setTransportNumbers(numbers);
                setTransport({ transportType: event.target.value.value, number: numbers[0].number })
                ShowRouteHandler({ transportType: event.target.value.value, number: numbers[0].number });
                break;
            case "number":
                setTransport({ ...transport, [event.target.name]: event.target.value.value })
                ShowRouteHandler({ transportType: transport.transportType, number: event.target.value.value });
                break;
            default:
                break;
        }
    }

    const addFormHandleChange = async (event) => {
        switch (event.target.name) {
            case "transportType":
                setTransport({ ...transport, [event.target.name]: event.target.value.value })
                break;
            case "number":
                setTransport({ ...transport, [event.target.name]: event.target.value });
                break;
            default:
                break;
        }
    }

    const ShowAddFormHandler = () => {
        setShowAddForm(true); 
        message('Выбярыце транспарт i прыпынкi для маршрута');
        setRouteStops([]);
        setRoutes([]);
    }

    const CancelButtonHandler = () => {
        const defaultTransport = {
            transportType: transportTypes[0],
            number: 1
        };
        setTransport(defaultTransport)
        setShowAddForm(false); 
        ShowRouteHandler(defaultTransport)
    }

    const ShowOrDeleteForm = () => {
        return (
            <div className='showordelete-form'>
                <Select
                    styles={reactSelectStyles}
                    defaultValue={{ value: transport.transportType, label: transport.transportType }}
                    onChange={(transport) => handleChange({
                        target: {
                            name: "transportType",
                            value: transport
                        }
                    })}
                    options={transportTypes.map((type, index) => {
                        return { value: type, label: type }
                    })}
                    menuPortalTarget={document.body}
                />
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    defaultValue={{ value: transport.number, label: transport.number }}
                    onChange={(transport) => handleChange({
                        target: {
                            name: "number",
                            value: transport
                        }
                    })}
                    options={transportNumbers.map((number, index) => {
                        return { value: number.number, label: number.number }
                    })}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
                <button onClick={DeleteRouteHandler} className="waves-effect waves-light btn-small">Выдалiць</button>
                <button onClick={() => ShowRouteHandler(transport)} className="waves-effect waves-light btn-small">Паглядзець</button>
                <button onClick={ShowAddFormHandler} className="waves-effect waves-light btn-small">Форма дадання</button>
            </div>
        )
    }

    const AddForm = () => {
        return (
            <div className='add-form'>
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    defaultValue={{ value: transport.transportType, label: transport.transportType }}
                    onChange={(transport) => addFormHandleChange({
                        target: {
                            name: "transportType",
                            value: transport
                        }
                    })}
                    options={transportTypes.map((type, index) => {
                        return { value: type, label: type }
                    })}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
                <div className="input-field col s12">
                    <label>Номер</label>
                    <input placeholder="1" name="number" maxLength={5} type="text" className="validate" onChange={addFormHandleChange} />
                </div>
                <button onClick={AddRouteHandler} className="waves-effect waves-light btn-small">Дадаць</button>
                <button onClick={CancelButtonHandler} className="waves-effect waves-light btn-small">Адмянiць</button>
            </div>
        )
    }

    const CheckForm = () => {
        if (transport.transportType === null) {
            message('Тып транспорта не выбран')
            return false
        }
        if (transport.number === null || !(new RegExp(/^\d{1,3}[сэдав]?$/).test(transport.number))) {
            message('Некарэктны нумар')
            return false
        }
        return true
    }

    const ShowRouteHandler = async (transport) => {
        try {
            var transportFromDB = await request(`/api/transports?type=${transport.transportType}&number=${transport.number}`);
            if (!transportFromDB) {
                message('Транспарт не знойдзены')
                setRoutes([])
                return
            }
            const routeStops = await request(`/api/routes?type=${transport.transportType}&number=${transport.number}`);
            if (!routeStops) {
                message('Маршрут не знойдзены')
                setRoutes([])
                return
            }
            fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${routeStops.sort(e => e.stopOrder).map((stop) => `${stop.stopId.longitude},${stop.stopId.latitude}`).join(';')}?steps=true&geometries=geojson&access_token=${MAP_TOKEN}`)
                .then((res) => res.json())
                .then((data) => {
                    setRoutes(data.routes[0].geometry.coordinates);
                })
                .catch((error) => console.error(error));
        } catch (e) { }
    }

    const DeleteRouteHandler = async () => {
        try {
            if (window.confirm('Вы упэўненыя што жадаеце выдаліць маршрут?')) {
                if (!CheckForm()) {
                    return
                }
                var transportFromDB = await request(`/api/transports?type=${transport.transportType}&number=${transport.number}`);
                if (transportFromDB) {
                    const data = await request(`/api/routes`, 'DELETE', { transport: transportFromDB })
                    setRouteStops([]);
                    setRoutes([]);
                    setTransport({
                        transportType: null,
                        number: null
                    })
                } else {
                    message('Транспарт не знойдзены')
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    const AddRouteHandler = async () => {
        try {
            //console.log({ stops: routeStops, transport: transport })
            if (!CheckForm()) {
                return
            }
            if (routeStops.length < 2) {
                return message('Маршрут не можа быць менш за 2 прыпынка')
            }
            var transportFromDB = await request(`/api/transports?type=${transport.transportType}&number=${transport.number}`);
            if (transportFromDB) {
                if (window.confirm('Маршрут для транспарту з такiм нумарам ужо створан. Жадаеце змянiць яго?')) {
                    const data = await request(`/api/routes`, 'PUT', { transport: transportFromDB })
                    console.log(data);
                } else {
                    return;
                }
            } else {
                const data = await request(`/api/transports`, 'POST', { transport: transport });
                transportFromDB = data.transport;
            }
            console.log(transportFromDB)
            const data = await request('/api/routes', 'POST', { stops: routeStops, transport: transportFromDB });
            console.log(data);
            message('Маршрут добавлен')
            setRouteStops([]);
            setRoutes([]);
            setTransport({
                transportType: transportTypes[0],
                number: 1
            })
        } catch (e) { }
    }

    return (
        stops &&
        <div className="container" style={{ "marginBottom": "50px" }}>
            <ReactMapGL
                {...viewState}
                onMove={event => setViewState(event.viewState)}
                style={{ width: "100%", height: 600 }}
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
                routeStops && {routeStops.map(stop => {
                    return (
                        <CustomMarker
                            key={stop._id}
                            stop={stop}
                            icon={flag}
                            height={ZOOM * 2 + "px"}
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
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: routes
                        }
                    }}>
                        <Layer {...ROUTE_LAYER} />
                    </Source>
                )}
            </ReactMapGL>
            {showAddForm ? AddForm() : ShowOrDeleteForm()}
            {!showAddForm && <AdminSchedule transport={transport} />}
        </div>
    )
}
