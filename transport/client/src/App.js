import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useRoutes } from "./routes";
import { useAuth } from "./hooks/auth.hook";
import { Navbar } from "./components/Navbar";
import 'materialize-css';
import { AuthContext } from "./context/AuthContext";
import { Loader } from "./components/Loader";
import { useHttp } from "./hooks/http.hook";
import { options } from "./components/arrays";
import io from "socket.io-client";
import { useMessage } from "./hooks/message.hook";

const socket = io.connect("https://localhost:5000");

function App() {
  const { login, logout, userId, ready, userRole } = useAuth();
  const flag = true;
  const message = useMessage();
  const { request } = useHttp();
  // console.log('App.js: userRole = ', userRole)

  const routes = useRoutes(userRole);
  if (!ready || userRole === undefined) {
    return <Loader />
  }

  if (userRole !== null && userRole !== undefined) {
    socket.on("message", (receivedMessage) => {
      const receivedTickets = JSON.parse(receivedMessage);
      //console.log('user ' + userId)
      const tickets = receivedTickets.filter(e => e.owner === userId)
      if (tickets && tickets.length > 0) {
        var messageText;
        var confirmationNeeded = false;

        console.log(tickets)
      
        tickets.forEach((ticket) => {
          if (ticket.ticketType.type === options.type[0]) {
            messageText = "Бiлет на " + ticket.ticketType.transport + " на " + ticket.ticketType.tripCount + " колькасць паездак скончыўся";
          } else {
            messageText = "Бiлет на " + ticket.ticketType.transport + " на " + ticket.ticketType.duration + " сутак скончыўся";
          }
      
          if (!confirmationNeeded && window.confirm(messageText)) {
            confirmationNeeded = true;
          }
        });
      
        if (confirmationNeeded) {
          // Make the API call to update the tickets
          tickets.forEach(async (ticket) => {
            await request('/api/tickets', 'PUT', ticket);
          });
        }
      }      
    })
  }

  return (
    <AuthContext.Provider value={{ userId, login, logout, userRole }}>
      <Router>
        {userRole && <Navbar />}
        <div style={{ "width": "100%", "margin": "auto" }}>
          {routes}
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;