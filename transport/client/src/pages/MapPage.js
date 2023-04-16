import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import Map, { Marker, Popup } from 'react-map-gl';
import ReactMapGL, {
    FullscreenControl,
    GeolocateControl,
    FlyToInterpolator,
} from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import busIcon from "../styles/images/bus-icon.svg"

export const MapPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState();
    const [viewState, setViewState] = useState({
        latitude: 53.893009,
        longitude: 27.567444,
        zoom: 11
    });
    const [selectedStop, setSelectedStop] = useState(null);
    const geolocateControlStyle = {
        left: 10,
        top: 10,
    };

    const fullscreenControlStyle = {
        right: 10,
        top: 10,
    };

    const getStops = useCallback(async () => {
        const data = await request('/api/stops', 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        setStops(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getStops();
    }, [getStops])

    if (loading) {
        return <Loader />
    }

    const closePopup = () => {
        setSelectedStop(null)
    };

    const openPopup = (stop) => {
        setSelectedStop(stop)
    }

    const CustomPopup = ({ stop, closePopup }) => {
        return (
            <Popup
                latitude={stop.latitude}
                longitude={stop.longitude}
                onClose={closePopup}
                closeButton={true}
                closeOnClick={false}
                offsetTop={-30}
            >
                {stop.name}
            </Popup>
        )
    };

    const CustomMarker = ({ stop, openPopup }) => {
        return (
            <Marker
                longitude={stop.longitude}
                latitude={stop.latitude}>
                <div className="marker" onClick={() => openPopup(stop)}>
                    <img src={busIcon} alt="marker" height={viewState.zoom + "px"}/>
                </div>
            </Marker>
        )
    };



    return (
        stops &&
        <div>
            <Map
                {...viewState}
                onMove={event => setViewState(event.viewState)}
                style={{ width: 800, height: 600 }}
                mapboxAccessToken="pk.eyJ1IjoidmFsZXJpZTE0My12YWxlcmllIiwiYSI6ImNsZ2RwNHJ3MTAwdXUzc256bHMwc2dpOWwifQ.v4F89QHCuyottjdKLOFfKg"
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
                    return(
                        <CustomMarker
                          key={stop._id}
                          stop={stop}
                          openPopup={openPopup}
                         />
                        )})}
                {selectedStop !== null &&
                        <CustomPopup
                        stop={selectedStop}
                        closePopup={closePopup}
                      />}
            </Map>
        </div>
    )
}
