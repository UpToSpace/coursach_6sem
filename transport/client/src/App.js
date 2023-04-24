import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useRoutes } from "./routes";
import { useAuth } from "./hooks/auth.hook";
import { Navbar } from "./components/Navbar";
import 'materialize-css';
import { AuthContext } from "./context/AuthContext";
import { Loader } from "./components/Loader";

function App() {
  const { login, logout, token, userId, ready } = useAuth();
  const isAuthenticated = !!token;
  const routes = useRoutes(isAuthenticated);
  if (!ready) {
    return <Loader />
  }

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, isAuthenticated }}>
        <Router>
          {isAuthenticated && <Navbar />}
          <div style={{"width" : "90%", "margin" : "auto"}}>
            {routes}
          </div>
        </Router>
    </AuthContext.Provider>
  );
}

export default App;
