import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useRoutes } from "./routes";
import { useAuth } from "./hooks/auth.hook";
import { Navbar } from "./components/Navbar";
import 'materialize-css';
import { AuthContext } from "./context/AuthContext";
import { Loader } from "./components/Loader";
import { useHttp } from "./hooks/http.hook";

function App() {
  const { request } = useHttp();
  const { login, logout, userId, ready, userRole } = useAuth();
  console.log('App.js: userRole = ', userRole)
  const routes = useRoutes(userRole);
  if (!ready) {
    return <Loader />
  }

  return (
    <AuthContext.Provider value={{ userId, login, logout, userRole }}>
        <Router>
          {userRole && <Navbar />}
          <div style={{"width" : "95%", "margin" : "auto"}}>
            {routes}
          </div>
        </Router>
    </AuthContext.Provider>
  );
}

export default App;