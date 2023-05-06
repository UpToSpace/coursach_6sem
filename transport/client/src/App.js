import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useRoutes } from "./routes";
import { useAuth } from "./hooks/auth.hook";
import { Navbar } from "./components/Navbar";
import 'materialize-css';
import { AuthContext } from "./context/AuthContext";
import { Loader } from "./components/Loader";

function App() {
  const { login, logout, token, userId, ready, userRole } = useAuth();
  const isAuthenticated = !!token;
  console.log('App.js: userRole = ', userRole)
  const routes = useRoutes(isAuthenticated, userRole);
  if (!ready) {
    return <Loader />
  }

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, isAuthenticated, userRole }}>
        <Router>
          {isAuthenticated && <Navbar />}
          <div style={{"width" : "95%", "margin" : "auto"}}>
            {routes}
          </div>
        </Router>
    </AuthContext.Provider>
  );
}

export default App;