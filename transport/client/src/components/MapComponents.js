import React, { useState } from 'react';
import { Marker, Popup } from 'react-map-gl';
import busIcon from "../styles/images/bus-icon.svg"

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

export const CustomPopup = ({ stop, closePopup }) => {
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

export const CustomMarker = ({ stop, openPopup }) => {
    return (
        <Marker
            longitude={stop.longitude}
            latitude={stop.latitude}>
            <div className="marker" onClick={() => openPopup(stop)}>
                <img src={busIcon} alt="marker" height={ZOOM + "px"} />
            </div>
        </Marker>
    )
};

