import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import Map, { Marker } from 'react-map-gl';
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
                {stops.map(stop => (
                    <Marker
                        key={stop._id}
                        latitude={stop.latitude}
                        longitude={stop.longitude}
                    >
                        <img src={busIcon} alt="marker" height={viewState.zoom + "px"} />
                    </Marker>
                ))
                }
            </Map>
        </div>
    )
}
