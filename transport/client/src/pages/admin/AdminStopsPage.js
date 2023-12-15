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
import cancelIcon from "../../styles/images/cancel.svg"

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
    const [addStopHandler, setAddStopHandler] = useState(false);
    const [stop, setStop] = useState({
        name: '',
        latitude: '',
        longitude: ''
    });

    const getStops = useCallback(async () => {
        const data = await request('/api/stops', 'GET', null);
        setStops(data);
        //console.log(data);
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
        setSelectedStop(null)
    };

    const deleteButtonHandler = async () => {
        if (window.confirm('Вы упэўнены, што хочаце выдалiць ' + selectedStop.name + '?')) {
            const data = await request('/api/stops/' + selectedStop._id, 'DELETE', null);
            message(data.message)
            await getStops();
        }
    }

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

    const AddStopHandler = async () => {
        setAddStopHandler(true);
        if (addStopHandler) {
            if (!stop.name || !stop.latitude || !stop.longitude) {
                return message('Запоўнiце ўсе палi');
            }
            if (stop.name.length < 3) {
                return message('Назва прыпынка павiнна быць больш за 3 сiмвалы');
            }
            try {
                const { name, latitude, longitude } = stop;
                console.log(name, latitude, longitude);
                const data = await request('/api/stops', 'POST', { name, latitude, longitude });
                message('Прыпынак паспяхова дададзены ' + name);
                await getStops();
                setStop({ name: '', latitude: '', longitude: '' });
                //navigate('/admin');
            } catch (e) { }
        } else {
            message('Выбярыце месцазнаходжанне прыпынка');
        }
    }

    const FindStopHandler = async () => {
        if (!stop.name) {
            return message('Запоўнiце назву прыпынка');
        }
        try {
            const foundStops = stops.filter(e => e.name.toLowerCase().includes(stop.name.toLowerCase()));
            if (foundStops.length === 0) {
                setFoundStops(null);
                return message('Прыпынкi не знойдзены');
            }
            console.log(stops)
            console.log(foundStops)
            setFoundStops(foundStops);
        } catch (e) { }
    }

    const ClearButtonHandler = async () => {
        setFoundStops(null);
        setStop({ name: '', latitude: '', longitude: '' });
    }

    const HideButtonHandler = () => {
        setAddStopHandler(!addStopHandler);
        setFoundStops(null);
        setStop({ name: '', latitude: '', longitude: '' });
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
                    <button onClick={AddStopHandler} className="waves-effect waves-light btn-large">Дадаць</button>
                    {addStopHandler && <button onClick={HideButtonHandler} className="waves-effect waves-light btn-large">Схаваць</button>}
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
                        <ReactMapGL // a map component
                            {...viewState}
                            onMove={event => setViewState(event.viewState)}
                            onClick={addStopHandler && MapClickHandler}
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
                            {stops.map(stop => {
                                return (
                                    <CustomMarker
                                        key={stop._id}
                                        stop={stop}
                                        openPopup={openPopup}
                                        height={viewState.zoom + "px"}
                                    />
                                )
                            })}
                            {selectedStop !== null &&
                                <CustomPopup
                                    stop={selectedStop}
                                    closePopup={closePopup}
                                    deleteButtonHandler={deleteButtonHandler}
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
                                <Source
                                    id="track"
                                    type="geojson"
                                    data={{
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

