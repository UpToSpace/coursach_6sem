import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';

export const TicketsPage = () => {
    const { loading, request } = useHttp();
    const auth = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);

    const getTickets = useCallback(async () => {
        const data = await request('/api/ticket', 'GET', null, {
            Authorization: `Bearer ${auth.token}`
        });
        setTickets(data);
        console.log(data);
    }, [auth.token, request])

    useEffect(() => {
        getTickets();
    }, [getTickets])

    if(loading) {
        return <Loader />
    }

    return (
        <div>
            <h1>TicketsPage</h1>   
        <table className="highlight">
        <thead>
          <tr>
              <th>Name</th>
              <th>Item Name</th>
              <th>Item Price</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Alvin</td>
            <td>Eclair</td>
            <td>$0.87</td>
          </tr>
          <tr>
            <td>Alan</td>
            <td>Jellybean</td>
            <td>$3.76</td>
          </tr>
          <tr>
            <td>Jonathan</td>
            <td>Lollipop</td>
            <td>$7.00</td>
          </tr>
        </tbody>
      </table>
        </div>
    )
}