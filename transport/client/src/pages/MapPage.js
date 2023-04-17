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
import busIcon from "../styles/images/bus-icon.svg"

const MAP_TOKEN = "pk.eyJ1IjoidmFsZXJpZTE0My12YWxlcmllIiwiYSI6ImNsZ2RwNHJ3MTAwdXUzc256bHMwc2dpOWwifQ.v4F89QHCuyottjdKLOFfKg";
const SECRET_TOKEN = "sk.eyJ1IjoidmFsZXJpZTE0My12YWxlcmllIiwiYSI6ImNsZ2tsaWVpMTBkdzQzZHFxOW53M2hoanAifQ.v_wnapRnZGiB1Xof48SmPw"

export const MapPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState();
    const [routes, setRoutes] = useState([]);
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

    const ROUTE_LAYER = {
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round',
        },
        paint: {
            'line-color': '#888',
            'line-width': 8,
        },
      };

    useEffect(() => {
        getStops();
        // Make a request to the Mapbox Directions API
        // fetch(
        //     // `https://api.mapbox.com/directions/v5/mapbox/driving/${stops
        //     //     .map((stop) => `${stop.longitude},${stop.latitude}`).join(';')}?
        //     //     access_token=${MAP_TOKEN}}`,
        //     `https://api.mapbox.com/directions/v5/mapbox/driving/27.5748,53.83616;27.57468,53.84002?access_token=${MAP_TOKEN}`,
        //     {
        //         method: 'GET',
        //         headers: {
        //             'Authorization': `Bearer ${MAP_TOKEN}`,
        //             'Content-Type': 'application/json'
        //         }
        //     }
        // )
        //     .then((response) => response.json())
        //     .then((data) => {
        //         // Save the routes in state
        //         console.log(data);
        //         setRoutes({
        //             type: 'FeatureCollection',
        //             features: data.routes.map((route) => ({
        //                 type: 'Feature',
        //                 geometry: {
        //                     type: 'LineString',
        //                     coordinates: route.geometry,
        //                 },
        //                 properties: {
        //                     color: 'blue',
        //                 },
        //             })),
        //         });
        //     })
        //     .catch((error) => {
        //         console.log('Error fetching routes', error);
        //     });
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/27.5748,53.83616;27.57468,53.84002?geometries=geojson&access_token=${MAP_TOKEN}`;
        //const url = `https://api.mapbox.com/directions/v5/mapbox/driving/53.83616,27.5748;53.84002,27.57468?geometries=geojson&access_token=${MAP_TOKEN}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => setRoutes(data.routes[0].geometry.coordinates))
            .catch((error) => console.error(error));
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
                    <img src={busIcon} alt="marker" height={viewState.zoom + "px"} />
                </div>
            </Marker>
        )
    };

    return (
        stops &&
        <div>
            <ReactMapGL
                {...viewState}
                onMove={event => setViewState(event.viewState)}
                style={{ width: 800, height: 600 }}
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
        </div >
    )
}
