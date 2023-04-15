import React, { useCallback, useContext, useEffect, useState} from "react";
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';

export const AdminStopsPage = () => { // TODO: returns a form adds a new stop and pages with stops
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [stops, setStops] = useState();

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
        return <Loader/>
    }

    return (<></>
    )
}
