import { useNavigate } from "react-router-dom";
import M from 'materialize-css';
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../../hooks/http.hook';
import { useMessage } from '../../hooks/message.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import flagIcon from "../../styles/images/flag.svg"
import Map, { Marker, Popup, Source } from 'react-map-gl';
import ReactMapGL, {
    FullscreenControl,
    GeolocateControl,
    Layer,
} from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    MAP_TOKEN, geolocateControlStyle, fullscreenControlStyle, CustomMarker, CustomPopup,
    ROUTE_LAYER, CENTER, ZOOM, POINT_LAYER
} from '../../components/MapComponents';

export const AdminStopsPage = () => {
    const { loading, request } = useHttp();
    const message = useMessage();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState(null);
    const [selectedStop, setSelectedStop] = useState(null);
    const [foundStops, setFoundStops] = useState(null);
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: ZOOM
    });
    const navigate = useNavigate();
    const [stop, setStop] = useState({
        name: '',
        latitude: '',
        longitude: ''
    });

    const getStops = useCallback(async () => {
        const data = await request('/api/stops', 'GET', null);
        setStops(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getStops();
        M.updateTextFields();
    }, [getStops])

    if (loading) {
        return <Loader />
    }

    const closePopup = async () => {
        console.log(selectedStop);
        if (window.confirm('Вы уверены, что хотите удалить остановку ' + selectedStop.name + '?')) {
            const data = await request('/api/stops/' + selectedStop._id, 'DELETE', null);
            message(data.message)
            await getStops();
        }
        setSelectedStop(null)
    };

    const openPopup = (stop) => {
        setSelectedStop(stop)
    }

    const OnChangeHandler = (event) => {
        setStop({ ...stop, [event.target.name]: event.target.value });
    };

    const AddStopHandler = async () => {
        if (!stop.name || !stop.latitude || !stop.longitude) {
            return message('Заполните все поля');
        }
        if (stop.name.length < 3) {
            return message('Название остановки должно быть не менее 3 символов');
        }
        try {
            // console.log(stop.name);
            // const existStops = await request('/api/stops', 'GET')
            // const existStop = existStops.filter((e) => e.name.toLowerCase() === stop.name.toLowerCase());
            // console.log(existStop);
            // if (existStop.length > 0) {
            //     M.updateTextFields();
            //     return message('Остановка с таким названием уже существует');    
            // }
            const { name, latitude, longitude } = stop;
            console.log(name, latitude, longitude);
            const data = await request('/api/stops', 'POST', { name, latitude, longitude });
            message('Прыпынак паспяхова дададзены ' + name);
            await getStops();
            setStop({ name: '', latitude: '', longitude: '' });
            //navigate('/admin');
        } catch (e) { }
    }

    const FindStopHandler = async () => {
        if (!stop.name) {
            return message('Заполните поле');
        }
        try {
            const foundStops = stops.filter(e => e.name.toLowerCase().includes(stop.name.toLowerCase()));
            if (!foundStops) {
                return message('Прыпынкi не знойдзены');
            }
            console.log(stops)
            console.log(foundStops)
            setFoundStops(foundStops);
        } catch (e) { }
    }

    const AddStopForm = () => {
        return (
            <div className="col s12 container">
                <div className="row">
                    <div className="input-field col s6">
                        <label>
                            Название остановки:</label>
                        <input type="text" className="validate" name="name" value={stop.name} onChange={OnChangeHandler} />
                    </div>
                </div>
                <div className="row">
                    <button onClick={AddStopHandler} className="waves-effect waves-light btn-large">Добавить</button>
                    <button onClick={FindStopHandler} className="waves-effect waves-light btn-large">Знайсцi</button>
                    <button onClick={(e) => setFoundStops(null)} className="waves-effect waves-light btn-large">Ачысцiць</button>
                </div>
            </div>
        )
    }

    const MapClickHandler = (event) => {
        setStop({ ...stop, latitude: event.lngLat.lat, longitude: event.lngLat.lng });
    }

    return (
        <div className="container" style={{ "marginBottom": "50px" }}>
            {AddStopForm()}
            {stops &&
                <div>
                    <div className="line">
                        <ReactMapGL
                            {...viewState}
                            onMove={event => setViewState(event.viewState)}
                            onClick={MapClickHandler}
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
                            {foundStops && foundStops.map(foundStop => {
                                    return (<CustomMarker
                                        key={foundStop._id}
                                        stop={foundStop}
                                        openPopup={openPopup}
                                        icon={flagIcon}
                                        height={ZOOM * 2 + "px"}
                                    />)
                                })}
                            {stop && (
                                <Source id="track" type="geojson" data={{
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [stop.longitude, stop.latitude]
                                    }
                                }}>
                                    <Layer {...POINT_LAYER} />
                                </Source>
                            )}
                        </ReactMapGL>
                    </div>
                </div >}
        </div>
    )
}

