import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import moment from 'moment';
import 'moment/locale/be';

export const TicketsPage = () => {
  const { loading, request } = useHttp();
  const auth = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const now = new Date()
  const getTickets = useCallback(async () => {
    const data = await request('/api/tickets', 'GET', null);
    setTickets(data);
    console.dir(data);
  }, [auth.token, request])

  useEffect(() => {
    getTickets();
  }, [getTickets])

  if (loading) {
    return <Loader />
  }
  moment.locale('be');

  return (
    <div>
      <h1>Вашы бiлеты</h1>
      <button className="waves-effect waves-light btn-large"><a href="/tickets/buy">Набыць бiлет</a></button>
      <table className="highlight centered">
        <thead>
          <tr>
            <th>Транспарт</th>
            <th>Паездкі</th>
            <th>Суткі</th>
            <th>Дата пачатку</th>
            <th>Дата заканчэння</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {tickets.sort(function (a, b) {
            return new Date(b.dateEnd) - new Date(a.dateEnd);
          }).map((ticket, index) => {
            return (
              <tr key={index} className={new Date(ticket.dateEnd).getTime() < now.getTime() ? 'not-active' : undefined}>
                <td>{ticket.ticketType.transport}</td>
                {ticket.ticketType.tripCount === -1 ? <td>-</td> : <td>{ticket.ticketType.tripCount}</td>}
                {ticket.ticketType.tripCount === -1 ? <td>{ticket.ticketType.duration}</td> : <td>-</td>}
                <td>{moment(ticket.dateBegin).format('LLLL')}</td>
                <td>{moment(ticket.dateEnd).format('LLLL')}</td>
                <td><a href={`/tickets/${ticket._id}`}>Падрабязней</a></td>
              </tr>
            )
          }
          )}
        </tbody>
      </table>
    </div>
  )
}