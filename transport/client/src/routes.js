import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { MainPage } from "./pages/MainPage";
import { MapPage } from "./pages/MapPage";
import { NotFoundPage } from "./pages/errorpages/NotFoundPage";
import { AdminStopsPage } from "./pages/admin/AdminStopsPage";
import { AdminRoutesPage } from "./pages/admin/AdminRoutesPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { AccountPage } from "./pages/AccountPage";
import { roles } from "./components/arrays";

export const useRoutes = (userRole) => {
    if (userRole === roles[0]) { // admin
        return (
            <Routes>
                <Route path="/account" element={<AccountPage />} />
                <Route path="/admin" exact element={<AdminPage />} />
                <Route path="/admin/stops" exact element={<AdminStopsPage />} />
                <Route path="/admin/routes" exact element={<AdminRoutesPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/" exact element={<MainPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        );
    }

    if (userRole === roles[1]) { // user
        return (
            <Routes>
                <Route path="/account" element={<AccountPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/" exact element={<MainPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="*" exact element={
                <AuthPage />
            } />
            {/* <Route path="*" element={
                <Navigate to="/" />
            } /> */}
        </Routes>
    );
}