import busIcon from "../styles/images/bus-icon.svg"
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import flagIcon from "../styles/images/flag.svg"
import flag from "../styles/images/redflag.svg"
import blueflag from "../styles/images/blueflag.svg"
import redflagIcon from "../styles/images/redflag.svg"
import { Marker, Popup, Source } from 'react-map-gl';
import ReactMapGL, {
    FullscreenControl,
    GeolocateControl,
    Layer,
} from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { SelectedStopInfo } from './SelectedStopInfo';

export const MAP_TOKEN = "pk.eyJ1IjoidmFsZXJpZTE0My12YWxlcmllIiwiYSI6ImNsZ2RwNHJ3MTAwdXUzc256bHMwc2dpOWwifQ.v4F89QHCuyottjdKLOFfKg";
export const SECRET_TOKEN = "sk.eyJ1IjoidmFsZXJpZTE0My12YWxlcmllIiwiYSI6ImNsZ2tsaWVpMTBkdzQzZHFxOW53M2hoanAifQ.v_wnapRnZGiB1Xof48SmPw"
export const CENTER = [27.567444, 53.893009];
export const ZOOM = 11;

export const geolocateControlStyle = {
    left: 10,
    top: 10,
};

export const fullscreenControlStyle = {
    right: 10,
    top: 10,
};


export const ROUTE_LAYER = {
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
        'line-join': 'round',
        'line-cap': 'round',
    },
    paint: {
        'line-color': '#a3e339',
        'line-width': ZOOM * 0.4,
    },
};

export const POINT_LAYER = {
    id: 'point',
    type: 'circle',
    source: 'route',
    paint: {
        'circle-radius': ZOOM * 0.7,
        'circle-color': '#f30',
    },
};

export const CustomPopup = ({ stop, closePopup, deleteButtonHandler }) => {
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
            {deleteButtonHandler && <div><button onClick={() => deleteButtonHandler(stop._id)}>Выдаліць</button></div>}
        </Popup>
    )
};

export const CustomMarker = ({ stop, openPopup, icon, height }) => {
    return (
        <Marker
            longitude={stop.longitude}
            latitude={stop.latitude}>
            <div className="marker" onClick={() => openPopup ? openPopup(stop) : null}>
                <img src={icon ?? busIcon} alt="marker" height={height ?? ZOOM + "px"} />
            </div>
        </Marker>
    )
};

export const BaseMap = ({
    openPopup, stops, foundStops, stop, addStopHandler, 
    selectedStop, closePopup, deleteButtonHandler, MapClickHandler,
    routeStops, routes, routeStopsForSelectedTransport,
    FindNearestStopsHandler, setNearestStops, nearestStops, user=false,
    showTransportRoute, favourites, selectedTransport, setSelectedTransport,
    showOnlyFavourites }) => {
    const [viewState, setViewState] = useState({
        latitude: CENTER[1],
        longitude: CENTER[0],
        zoom: ZOOM
    });

    return <ReactMapGL // a map component
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
            onGeolocate={FindNearestStopsHandler}
            onTrackUserLocationEnd={() => setNearestStops && setNearestStops([])}
        />
        {stops?.map(stop => {
            return (
                <CustomMarker
                    key={stop._id}
                    stop={stop}
                    openPopup={openPopup}
                    height={viewState.zoom + "px"}
                />
            )
        })}
        {routeStops?.map(stop => {
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
        {routeStopsForSelectedTransport?.map(stop => { // TODO
            return (
                <CustomMarker
                    key={stop._id}
                    stop={stop.stopId}
                    icon={blueflag}
                    height={ZOOM * 2 + "px"}
                    openPopup={openPopup}
                />
            )
        })}
        {selectedStop && 
            <CustomPopup
                stop={selectedStop}
                closePopup={closePopup}
                deleteButtonHandler={deleteButtonHandler}
            />}
        {foundStops?.map(foundStop => {
            return (<CustomMarker
                key={foundStop._id}
                stop={foundStop}
                openPopup={openPopup}
                icon={flagIcon}
                height={ZOOM * 2 + "px"}
            />)
        })}
        {(user && (routes || selectedStop !== null) || routes?.length !== 0) && (
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
        {nearestStops?.map(stop => { // stops nearest to user's location
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
}