import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../../hooks/http.hook';
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

export const AdminRoutesPage = () => {
    const { loading, request, error } = useHttp();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState();
    const [routes, setRoutes] = useState([]);
    const [routeStops, setRouteStops] = useState([]);
    const [transport, setTransport] = useState({
        transportType: null,
        number: null
    });
    const [selectedStop, setSelectedStop] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: ZOOM
    });
    const [selectOnFocus, setSelectOnFocus] = useState(false)

    const getStops = useCallback(async () => {
        const data = await request('/api/stops', 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        setStops(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getStops();
        M.updateTextFields()
    }, [getStops])

    if (loading) {
        return <Loader />
    }

    const closePopup = () => {
        setSelectedStop(null)
    };

    const openPopup = (stop) => {
        setSelectedStop(stop)
        if (routeStops.includes(stop)) {
            if (routeStops[routeStops.length - 1] !== stop) {
                return window.alert('You can only remove the last stop in the route')
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
                fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${[...routeStops, stop].map((stop) => `${stop.longitude},${stop.latitude}`).join(';')}?steps=true&geometries=geojson&access_token=${MAP_TOKEN}`)
                    .then((res) => res.json())
                    .then((data) => {
                        console.log([...routeStops, stop])
                        console.log(data)
                        setRoutes(data.routes[0].geometry.coordinates);
                    })
                    .catch((error) => console.error(error));
            }
        }
    }

    const handleChange = (event) => {
        event.target.name === "transportType" ? setTransport({ ...transport, [event.target.name]: event.target.value.value }) :
            setTransport({ ...transport, [event.target.name]: event.target.value });
    }

    const AddForm = () => {
        return (
            <div>
                <div style={selectOnFocus ? {"marginBottom": "150px"} : undefined}>
                    <Select
                        value={transport.transport}
                        onChange={(transport) => handleChange({
                            target: {
                                name: "transportType",
                                value: transport
                            }
                        })}
                        options={transportTypes.map((type, index) => {
                            return { value: type, label: type }
                        })}
                        onMenuOpen={() => setSelectOnFocus(true)}
                        onMenuClose={() => setSelectOnFocus(false)}
                    />
                </div>
                <div className="input-field col s12">
                    <label>Номер</label>
                    <input placeholder="" name="number" type="text" defaultValue={transport.number} className="validate" onChange={handleChange} />
                </div>
                <button onClick={AddRouteHandler} className="waves-effect waves-light btn-small">Добавить</button>
                <button onClick={DeleteRouteHandler} className="waves-effect waves-light btn-small">Удалить</button>
            </div>
        )
    }

    const DeleteRouteHandler = async () => {
        try {
            if (transport.transportType === null) {
                return window.alert('Тип транспорта не выбран')
            }
            if (transport.number === null || !(new RegExp(/^\d{1,3}[сэдав]?$/).test(transport.number))) {
                return window.alert('Номер транспорта введен некорректно')
            }
            var transportFromDB = await request(`/api/transports?type=${transport.transportType}&number=${transport.number}`, 'GET', null, {
                Authorization: `Bearer ${auth.token}`
            });
            if (transportFromDB) {
                const data = await request(`/api/routes`, 'DELETE', { transport: transportFromDB }, {
                    Authorization: `Bearer ${auth.token}`
                })
                console.log(data);
            } else {
                window.alert('Транспорт не найден')
            }
        } catch (e) {
            console.log(e)
        }
    }

    const AddRouteHandler = async () => {
        try {
            //console.log({ stops: routeStops, transport: transport })
            if (transport.transportType === null) {
                return window.alert('Тип транспорта не выбран')
            }
            if (transport.number === null || !(new RegExp(/^\d{1,3}[сэдав]?$/).test(transport.number))) {
                return window.alert('Номер транспорта введен некорректно')
            }
            if (routeStops.length < 2) {
                return window.alert('Маршрут должен содержать минимум 2 остановки')
            }
            var transportFromDB = await request(`/api/transports?type=${transport.transportType}&number=${transport.number}`, 'GET', null, {
                Authorization: `Bearer ${auth.token}`
            });
            if (transportFromDB) {
                if (window.confirm('Маршрут для транспорт с таким номером уже существует. Желаете измениить его?')) {
                    const data = await request(`/api/routes`, 'DELETE', { transport: transportFromDB }, {
                        Authorization: `Bearer ${auth.token}`
                    })
                    console.log(data);
                } else {
                    return;
                }
            } else {
                const data = await request(`/api/transports`, 'POST', { transport: transport }, {
                    Authorization: `Bearer ${auth.token}`
                });
                transportFromDB = data.transport;
            }
            console.log(transportFromDB)
            const data = await request('/api/routes', 'POST', { stops: routeStops, transport: transportFromDB }, {
                Authorization: `Bearer ${auth.token}`
            });
            console.log(data);
            window.alert('Маршрут добавлен')
            setRouteStops([]);
            setRoutes([]);
            setTransport({
                transportType: null,
                number: null
            })
        } catch (e) { }
    }

    const Schedule = ({ stop }) => {
        return (
            <div>
                {stop.name}
            </div>
        )
    }

    return (
        stops &&
        <div className="container" style={{"marginBottom": "50px"}}>
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
            {AddForm()}
            {selectedStop && <Schedule stop={selectedStop} />}
        </div>
    )
}
