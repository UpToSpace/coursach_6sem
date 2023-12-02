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
import { useMessage } from "./hooks/message.hook";
import { ErrorBoundary } from './pages/errorpages/ErrorBoundary';


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

  return (
    <AuthContext.Provider value={{ userId, login, logout, userRole }}>
      <ErrorBoundary> 
        <Router>
          {userRole && <Navbar />}
          <div style={{ "width": "100%", "margin": "auto" }}>
            {routes}
          </div>
        </Router>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

export default App;