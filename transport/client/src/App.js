import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useRoutes } from "./routes";
import { useAuth } from "./hooks/auth.hook";
import { Navbar } from "./components/Navbar";
import 'materialize-css';
import { AuthContext } from "./context/AuthContext";
import { Loader } from "./components/Loader";
import { useHttp } from "./hooks/http.hook";
import { options } from "./components/arrays";

function App() {
  const { login, logout, userId, ready, userRole } = useAuth();
  // console.log('App.js: userRole = ', userRole)
  const routes = useRoutes(userRole);

  if (!ready || userRole === undefined) {
    return <Loader />
  }

  // const ws = new WebSocket('ws://localhost:5001');
  // ws.onopen = () => {
  //   if (localStorage.getItem("userData")) {
  //     console.log('here//')
  //     ws.id = JSON.parse(localStorage.getItem("userData")).userId;
  //     ws.send(JSON.stringify(JSON.parse(localStorage.getItem("userData")).userId))
  //   }
  // }
  // ws.onmessage = function (event) {
  //   const ticket = JSON.parse(event.data);
  //   console.log(ticket)
  //   var messageText;
  //   if (ticket.ticketType.type === options.type[0]) // На определенное количество поездок
  //   {
  //     messageText = "Бiлет на " + ticket.ticketType.transport + " на " + ticket.ticketType.tripCount + " количество поездок закончился";
  //   } else {
  //     messageText = "Бiлет на " + ticket.ticketType.transport + " на " + ticket.ticketType.duration + " суток закончился";
  //   }
  //   // message(messageText);
  //   ws.close();
  // };
  // ws.onclose = () => {
  //   //console.log('ws closed');
  // };

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