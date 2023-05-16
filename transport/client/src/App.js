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

  useEffect(() => {
    if (userId !== undefined && userId !== null) {
      socket.emit("subscribe", { userId: userId });
      socket.on("message", (receivedMessage) => {
        const receivedTicket = JSON.parse(receivedMessage);
        console.log('received message ' + receivedTicket)
        var messageText;
        var confirmationNeeded = false;

        if (receivedTicket.ticketType.type === options.type[0]) {
          messageText = "Бiлет на " + receivedTicket.ticketType.transport + " на " + receivedTicket.ticketType.tripCount + " колькасць паездак скончыўся";
        } else {
          messageText = "Бiлет на " + receivedTicket.ticketType.transport + " на " + receivedTicket.ticketType.duration + " сутак скончыўся";
        }

        if (!confirmationNeeded && window.confirm(messageText)) {
          confirmationNeeded = true;
        }

        if (confirmationNeeded) {
          request('/api/tickets', 'PUT', receivedTicket);
        }
      })
    }
  }, [request, userId, socket]);

  if (!ready || userRole === undefined) {
    return <Loader />
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