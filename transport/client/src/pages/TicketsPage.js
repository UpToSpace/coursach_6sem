import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';

export const TicketsPage = () => {
  const { loading, request } = useHttp();
  const auth = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);

  const getTickets = useCallback(async () => {
    const data = await request('/api/tickets', 'GET', null, {
      Authorization: `Bearer ${auth.token}`
    });
    setTickets(data);
    console.dir(data);
  }, [auth.token, request])

  useEffect(() => {
    getTickets();
  }, [getTickets])

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      <h1>TicketsPage</h1>
      <table className="highlight centered">
        <thead>
          <tr>
            <th>Транспорт</th>
            <th>Поездки</th>
            <th>Сутки</th>
            <th>Дата начала</th>
            <th>Дата окончания</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket, index) => {
            return (
              <tr key={index}>
                <td>{ticket.ticketType.transport}</td>
                {ticket.ticketType.tripCount === -1 ? <td>-</td> : <td>{ticket.ticketType.tripCount}</td>}
                {ticket.ticketType.tripCount === -1 ? <td>ticket.ticketType.duration</td> : <td>-</td>}
                <td>{ticket.dateBegin}</td>
                <td>{ticket.dateEnd}</td>
                <td><a href={`/tickets/${ticket._id}`}>Подробнее</a></td>
              </tr>
            )
          }
          )}
        </tbody>
      </table>
    </div>
  )
}