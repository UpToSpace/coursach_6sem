import M from 'materialize-css';
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHttp } from '../../hooks/http.hook';
import { useMessage } from '../../hooks/message.hook';
import { AuthContext } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BaseMap } from '../../components/MapComponents';
import cancelIcon from "../../styles/images/cancel.svg"

export const AdminStopsPage = () => {
    const { loading, request } = useHttp();
    const message = useMessage();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState(null);
    const [selectedStop, setSelectedStop] = useState(null);
    const [foundStops, setFoundStops] = useState(null);
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
        //console.log(selectedStop);
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
        if (!addStopHandler) {
            const foundStops = stops.filter(e => e.name.toLowerCase().includes(event.target.value.toLowerCase()));
            if (foundStops.length === 0 || event.target.value === '') {
                setFoundStops(null);
                return;
            }
            setFoundStops(foundStops);
        }
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
            {stops?.length !== 0 &&
                <div>
                    <div className="line">
                        <BaseMap
                            openPopup={openPopup}
                            stops={stops}
                            foundStops={foundStops}
                            stop={stop}
                            addStopHandler={addStopHandler}
                            selectedStop={selectedStop}
                            closePopup={closePopup}
                            deleteButtonHandler={deleteButtonHandler}
                            MapClickHandler={MapClickHandler}
                        >
                        </BaseMap>
                    </div>
                </div >}
        </div>
    )
}

